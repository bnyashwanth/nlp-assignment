package ai.linguabridge.app;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OnnxValue;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;

@CapacitorPlugin(name = "IndicTransOfflinePlugin")
public class IndicTransOfflinePlugin extends Plugin {
    private static final String TAG = "IndicTransOffline";

    private OrtEnvironment environment;
    private OrtSession encoderSession;
    private OrtSession decoderSession;
    private String loadedFamily;
    private JSONObject vocab;
    private Map<Integer, String> reverseVocab = new HashMap<>();
    private Map<String, Integer> specialTokens = new HashMap<>();
    private boolean nllbFallback;

    private static final Map<String, String> FLORES_CODES = new HashMap<>();
    private static final Map<String, String> SHORT_TO_FLORES = new HashMap<>();
    static {
        FLORES_CODES.put("eng_Latn", "en");
        FLORES_CODES.put("kan_Knda", "kn");
        FLORES_CODES.put("hin_Deva", "hi");
        FLORES_CODES.put("tam_Taml", "ta");
        FLORES_CODES.put("tel_Telu", "te");
        FLORES_CODES.put("en", "en");
        FLORES_CODES.put("kn", "kn");
        FLORES_CODES.put("hi", "hi");
        FLORES_CODES.put("ta", "ta");
        FLORES_CODES.put("te", "te");
        SHORT_TO_FLORES.put("en", "eng_Latn");
        SHORT_TO_FLORES.put("kn", "kan_Knda");
        SHORT_TO_FLORES.put("hi", "hin_Deva");
        SHORT_TO_FLORES.put("ta", "tam_Taml");
        SHORT_TO_FLORES.put("te", "tel_Telu");
    }

    private synchronized void unloadModel() {
        try {
            if (encoderSession != null) encoderSession.close();
        } catch (Exception e) {
            Log.w(TAG, "Error closing encoder session", e);
        }
        try {
            if (decoderSession != null) decoderSession.close();
        } catch (Exception e) {
            Log.w(TAG, "Error closing decoder session", e);
        }
        encoderSession = null;
        decoderSession = null;
        loadedFamily = null;
        reverseVocab.clear();
        specialTokens.clear();
    }

    private synchronized void ensureLoaded(String family) throws Exception {
        if (family.equals(loadedFamily) && encoderSession != null && decoderSession != null) return;
        unloadModel();

        Context context = getContext();
        File modelDir = new File(context.getFilesDir(), "indictrans2/" + family);
        if (!modelDir.exists() && !modelDir.mkdirs()) {
            throw new IllegalStateException("Could not create IndicTrans2 model directory");
        }

        String[] assets = {
            "encoder_model_quantized.onnx",
            "decoder_model_merged_quantized.onnx",
            "tokenizer.json",
            "sentencepiece.bpe.model",
            "config.json"
        };
        for (String asset : assets) {
            copyAssetOnce(family + "/" + asset, new File(modelDir, asset));
        }

        environment = OrtEnvironment.getEnvironment();
        try (OrtSession.SessionOptions options = new OrtSession.SessionOptions()) {
            options.setMemoryPatternOptimization(false);
            options.setIntraOpNumThreads(Math.max(1, Math.min(4, Runtime.getRuntime().availableProcessors())));
            encoderSession = environment.createSession(
                new File(modelDir, "encoder_model_quantized.onnx").getAbsolutePath(), options);
            decoderSession = environment.createSession(
                new File(modelDir, "decoder_model_merged_quantized.onnx").getAbsolutePath(), options);
        }

        loadVocabulary(new File(modelDir, "tokenizer.json"));
        nllbFallback = false;
        File metadataFile = new File(modelDir, "export_metadata.json");
        if (metadataFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(metadataFile))) {
                StringBuilder metadata = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) metadata.append(line);
                nllbFallback = metadata.toString().toLowerCase().contains("nllb");
            } catch (Exception metadataError) {
                Log.w(TAG, "Could not read export metadata", metadataError);
            }
        }
        File configFile = new File(modelDir, "config.json");
        if (configFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(configFile))) {
                StringBuilder configJson = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) configJson.append(line);
                JSONObject config = new JSONObject(configJson.toString());
                String modelType = config.optString("model_type", "").toLowerCase();
                nllbFallback = "marian".equals(modelType)
                    || "m2m_100".equals(modelType)
                    || "nllb".equals(modelType)
                    || "nllb_moe".equals(modelType)
                    || configJson.toString().toLowerCase().contains("nllb");
            } catch (Exception configError) {
                Log.w(TAG, "Could not read NLLB fallback config", configError);
            }
        }
        loadedFamily = family;
        Log.i(TAG, "Loaded family " + family);
    }

    private void copyAssetOnce(String relativeAsset, File destination) throws Exception {
        if (destination.exists() && destination.length() > 0) return;
        try (InputStream input = getContext().getAssets().open("indictrans2/" + relativeAsset);
             FileOutputStream output = new FileOutputStream(destination)) {
            byte[] buffer = new byte[1024 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
        }
    }

    private void loadVocabulary(File tokenizerFile) throws Exception {
        StringBuilder json = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(tokenizerFile))) {
            String line;
            while ((line = reader.readLine()) != null) json.append(line);
        }
        JSONObject tokenizerJson = new JSONObject(json.toString());
        JSONObject model = tokenizerJson.optJSONObject("model");
        JSONObject loadedVocab = model == null ? null : model.optJSONObject("vocab");
        vocab = loadedVocab == null ? new JSONObject() : loadedVocab;

        Iterator<String> keys = vocab.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            reverseVocab.put(vocab.optInt(key), key);
        }

        JSONArray added = tokenizerJson.optJSONArray("added_tokens");
        if (added != null) {
            for (int i = 0; i < added.length(); i++) {
                JSONObject token = added.optJSONObject(i);
                if (token != null) {
                    specialTokens.put(token.optString("content"), token.optInt("id"));
                }
            }
        }
    }

    private int getTokenId(String token, int fallback) {
        Integer id = specialTokens.get(token);
        if (id != null) return id;
        id = vocab.optInt(token, Integer.MIN_VALUE);
        if (id != Integer.MIN_VALUE) return id;
        id = vocab.optInt("▁" + token, Integer.MIN_VALUE);
        if (id != Integer.MIN_VALUE) return id;
        return fallback;
    }

    private List<Integer> tokenize(String text, String sourceTag, String targetTag) {
        List<Integer> ids = new ArrayList<>();
        if (nllbFallback) {
            String sourceFlores = SHORT_TO_FLORES.get(sourceTag);
            ids.add(getTokenId(sourceFlores == null ? sourceTag : sourceFlores, 256202));
        } else {
            ids.add(getTokenId("<" + sourceTag + ">", 256202));
            ids.add(getTokenId("<" + targetTag + ">", 256200));
        }

        for (String rawWord : text.trim().split("\\s+")) {
            String word = rawWord.replaceAll("[\\p{Punct}]+$", "");
            if (word.isEmpty()) continue;
            String piece = ids.size() == 2 ? word : "▁" + word;
            Integer exact = vocab.optInt(piece, Integer.MIN_VALUE);
            if (exact != Integer.MIN_VALUE) {
                ids.add(exact);
            } else {
                exact = vocab.optInt(word, Integer.MIN_VALUE);
                if (exact != Integer.MIN_VALUE) {
                    ids.add(exact);
                } else {
                    for (int i = 0; i < word.length();) {
                        int end = word.offsetByCodePoints(i, 1);
                        ids.add(getTokenId(word.substring(i, end), vocab.optInt("<unk>", 3)));
                        i = end;
                    }
                }
            }
        }
        ids.add(2);
        return ids;
    }

    private String decode(List<Integer> ids) {
        StringBuilder output = new StringBuilder();
        for (Integer id : ids) {
            if (id == null || id == 2 || id == 0) continue;
            String piece = reverseVocab.get(id);
            if (piece == null || piece.startsWith("<") && piece.endsWith(">")) continue;
            if (piece.startsWith("▁")) {
                if (output.length() > 0) output.append(' ');
                output.append(piece.substring(1));
            } else {
                output.append(piece);
            }
        }
        return output.toString().trim();
    }

    private String familyFor(String source, String target) {
        String sourceShort = FLORES_CODES.get(source);
        String targetShort = FLORES_CODES.get(target);
        if (sourceShort == null || targetShort == null) return null;
        if (sourceShort.equals(targetShort)) return null;
        if (sourceShort.equals("en")) return "en-indic";
        if (targetShort.equals("en")) return "indic-en";
        return "indic-indic";
    }

    @PluginMethod
    public void translate(PluginCall call) {
        String text = call.getString("text", "").trim();
        String sourceLang = call.getString("sourceLang", "eng_Latn");
        String targetLang = call.getString("targetLang", "kan_Knda");
        String family = familyFor(sourceLang, targetLang);

        if (text.isEmpty()) {
            JSObject result = new JSObject();
            result.put("translatedText", "");
            result.put("latencyMs", 0);
            call.resolve(result);
            return;
        }
        if (family == null) {
            call.reject("INDICTRANS_INVALID_PAIR");
            return;
        }

        long start = System.currentTimeMillis();
        try {
            ensureLoaded(family);
            String sourceTag = FLORES_CODES.get(sourceLang);
            String targetTag = FLORES_CODES.get(targetLang);
            String[] sentences = text.split("(?<=[.!?।])\\s*");
            StringBuilder translatedText = new StringBuilder();

            for (String sentence : sentences) {
                String clean = sentence.trim();
                if (clean.isEmpty()) continue;
                String translated = translateSentence(clean, sourceTag, targetTag);
                if (translatedText.length() > 0) translatedText.append(' ');
                translatedText.append(translated);
            }

            JSObject result = new JSObject();
            result.put("translatedText", translatedText.toString());
            result.put("latencyMs", System.currentTimeMillis() - start);
            call.resolve(result);
        } catch (Exception error) {
            Log.e(TAG, "IndicTrans2 native inference failed", error);
            call.reject("INDICTRANS_ONNX_ERROR", error);
        }
    }

    private String translateSentence(String text, String sourceTag, String targetTag) throws Exception {
        List<Integer> sourceIds = tokenize(text, sourceTag, targetTag);
        long[] inputIds = new long[sourceIds.size()];
        long[] attention = new long[sourceIds.size()];
        for (int i = 0; i < sourceIds.size(); i++) {
            inputIds[i] = sourceIds.get(i);
            attention[i] = 1;
        }

        OnnxTensor encoderHidden;
        try (OrtSession.Result encoderResult = runEncoder(inputIds, attention)) {
            OnnxValue hiddenValue = null;
            for (Map.Entry<String, OnnxValue> entry : encoderResult) {
                if (entry.getValue() instanceof OnnxTensor) {
                    hiddenValue = entry.getValue();
                    break;
                }
            }
            if (!(hiddenValue instanceof OnnxTensor)) {
                throw new IllegalStateException("Encoder did not produce hidden states");
            }
            encoderHidden = (OnnxTensor) hiddenValue;

            int targetId = nllbFallback
                ? getTokenId(SHORT_TO_FLORES.get(targetTag), 256200)
                : getTokenId("<" + targetTag + ">", 256200);
            List<Integer> generated = new ArrayList<>();
            generated.add(targetId);
            Map<String, OnnxTensor> cacheTensors = new HashMap<>();

            for (int step = 0; step < 256; step++) {
                long[] decoderIds = new long[generated.size()];
                for (int i = 0; i < generated.size(); i++) decoderIds[i] = generated.get(i);

                Map<String, OnnxTensor> decoderInputs = new HashMap<>();
                Map<String, OnnxTensor> decoderInfo = new HashMap<>();
                for (String name : decoderSession.getInputNames()) {
                    String lower = name.toLowerCase();
                    if (lower.contains("use_cache_branch")) {
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new boolean[][]{{step > 0}}));
                    } else if (lower.contains("past_key_values") || lower.contains("past")) {
                        OnnxTensor cached = cacheTensors.get(name);
                        if (cached != null) decoderInputs.put(name, cached);
                    } else if (lower.contains("encoder") && (lower.contains("hidden") || lower.contains("output"))) {
                        decoderInputs.put(name, encoderHidden);
                    } else if (lower.contains("encoder") && (lower.contains("attention") || lower.contains("mask"))) {
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{attention}));
                    } else if (lower.contains("input") || lower.contains("decoder") || lower.contains("ids")) {
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{decoderIds}));
                    } else if (lower.contains("attention") || lower.contains("mask")) {
                        long[] decoderMask = new long[decoderIds.length];
                        for (int i = 0; i < decoderMask.length; i++) decoderMask[i] = 1;
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{decoderMask}));
                    }
                }

                try (OrtSession.Result decoderResult = decoderSession.run(decoderInputs)) {
                    int nextToken = 2;
                    for (Map.Entry<String, OnnxValue> entry : decoderResult) {
                        OnnxValue value = entry.getValue();
                        if (!(value instanceof OnnxTensor)) continue;
                        OnnxTensor tensor = (OnnxTensor) value;
                        long[] shape = tensor.getInfo().getShape();
                        if (shape.length == 3) {
                            FloatBuffer buffer = tensor.getFloatBuffer();
                            int vocabSize = (int) shape[2];
                            int sequenceLength = (int) shape[1];
                            buffer.position((sequenceLength - 1) * vocabSize);
                            float best = Float.NEGATIVE_INFINITY;
                            for (int i = 0; i < vocabSize; i++) {
                                float score = buffer.get();
                                if (score > best) {
                                    best = score;
                                    nextToken = i;
                                }
                            }
                        } else if (entry.getKey().toLowerCase().contains("past_key_values")) {
                            cacheTensors.put(entry.getKey(), tensor);
                        }
                        break;
                    }

                    if (nextToken == 2 || nextToken == 0) break;
                    generated.add(nextToken);
                } finally {
                    for (Map.Entry<String, OnnxTensor> input : decoderInputs.entrySet()) {
                        if (input.getValue() != encoderHidden && !cacheTensors.containsValue(input.getValue())) {
                            input.getValue().close();
                        }
                    }
                }
            }
            return decode(generated);
        } finally {
            if (encoderHidden != null) encoderHidden.close();
        }
    }

    private OrtSession.Result runEncoder(long[] inputIds, long[] attention) throws Exception {
        Map<String, OnnxTensor> encoderInputs = new HashMap<>();
        try {
            for (String name : encoderSession.getInputNames()) {
                String lower = name.toLowerCase();
                if (lower.contains("attention") || lower.contains("mask")) {
                    encoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{attention}));
                } else {
                    encoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{inputIds}));
                }
            }
            return encoderSession.run(encoderInputs);
        } finally {
            for (OnnxTensor tensor : encoderInputs.values()) tensor.close();
        }
    }
}
