package ai.linguabridge.app;

import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.nio.LongBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;

@CapacitorPlugin(name = "NllbOfflinePlugin")
public class NllbOfflinePlugin extends Plugin {
    private OrtEnvironment environment;
    private OrtSession encoderSession;
    private OrtSession decoderSession;
    private JSONObject tokenizerJson;
    private JSONObject vocab;
    private Map<Integer, String> reverseVocab;
    private Map<String, Integer> specialTokens;

    private static final Map<String, String> LANGUAGE_CODES = new HashMap<String, String>() {{
        put("eng_Latn", "eng_Latn");
        put("kan_Knda", "kan_Knda");
        put("hin_Deva", "hin_Deva");
        put("tam_Taml", "tam_Taml");
        put("tel_Telu", "tel_Telu");
    }};

    private synchronized void ensureLoaded() throws Exception {
        if (encoderSession != null && decoderSession != null) return;

        Context context = getContext();
        File modelDir = new File(context.getFilesDir(), "nllb");
        if (!modelDir.exists() && !modelDir.mkdirs()) {
            throw new IllegalStateException("Could not create native model directory");
        }

        String[] assets = {
            "encoder_model_quantized.onnx",
            "decoder_model_merged_quantized.onnx",
            "tokenizer.json",
            "sentencepiece.bpe.model",
            "config.json"
        };
        for (String asset : assets) copyAssetOnce(asset, new File(modelDir, asset));

        File encoderFile = new File(modelDir, "encoder_model_quantized.onnx");
        File decoderFile = new File(modelDir, "decoder_model_merged_quantized.onnx");
        if (!encoderFile.exists() || !decoderFile.exists()) {
            throw new IllegalStateException("Baked ONNX model assets are missing");
        }

        environment = OrtEnvironment.getEnvironment();
        try (OrtSession.SessionOptions options = new OrtSession.SessionOptions()) {
            options.setMemoryPatternOptimization(false);
            options.setIntraOpNumThreads(Math.max(1, Math.min(4, Runtime.getRuntime().availableProcessors())));
            encoderSession = environment.createSession(encoderFile.getAbsolutePath(), options);
            decoderSession = environment.createSession(decoderFile.getAbsolutePath(), options);
        }

        File tokenizerFile = new File(modelDir, "tokenizer.json");
        java.io.BufferedReader reader = new java.io.BufferedReader(
            new java.io.FileReader(tokenizerFile));
        StringBuilder json = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) json.append(line);
        reader.close();
        tokenizerJson = new JSONObject(json.toString());
        vocab = tokenizerJson.optJSONObject("model").optJSONObject("vocab");
        if (vocab == null) vocab = new JSONObject();
        reverseVocab = new HashMap<>();
        Iterator<String> keys = vocab.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            reverseVocab.put(vocab.optInt(key), key);
        }
        specialTokens = new HashMap<>();
        JSONArray added = tokenizerJson.optJSONArray("added_tokens");
        if (added != null) {
            for (int i = 0; i < added.length(); i++) {
                JSONObject token = added.optJSONObject(i);
                if (token != null) specialTokens.put(token.optString("content"), token.optInt("id"));
            }
        }
    }

    private void copyAssetOnce(String assetName, File destination) throws Exception {
        if (destination.exists() && destination.length() > 0) return;
        try (InputStream input = getContext().getAssets().open("nllb/" + assetName);
             FileOutputStream output = new FileOutputStream(destination)) {
            byte[] buffer = new byte[1024 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
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

    private List<Integer> tokenize(String text, String sourceLang) {
        List<Integer> ids = new ArrayList<>();
        ids.add(getTokenId(LANGUAGE_CODES.get(sourceLang), 256202));
        String normalized = text.trim();
        if (normalized.isEmpty()) return ids;

        String[] words = normalized.split("\\s+");
        boolean first = true;
        for (String rawWord : words) {
            String word = rawWord.replaceAll("[\\p{Punct}]+$", "");
            if (word.isEmpty()) continue;
            String piece = first ? word : "▁" + word;
            first = false;
            Integer exact = vocab.optInt(piece, Integer.MIN_VALUE);
            if (exact != Integer.MIN_VALUE) {
                ids.add(exact);
                continue;
            }
            exact = vocab.optInt(word, Integer.MIN_VALUE);
            if (exact != Integer.MIN_VALUE) {
                ids.add(exact);
                continue;
            }
            for (int i = 0; i < word.length();) {
                int end = word.offsetByCodePoints(i, 1);
                String character = word.substring(i, end);
                ids.add(getTokenId(character, vocab.optInt("<unk>", 3)));
                i = end;
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
            if (piece == null) continue;
            if (piece.startsWith("▁")) {
                if (output.length() > 0) output.append(' ');
                output.append(piece.substring(1));
            } else if (piece.equals("</s>") || piece.startsWith("<") && piece.endsWith(">")) {
                continue;
            } else {
                output.append(piece);
            }
        }
        return output.toString().trim();
    }

    @PluginMethod
    public void translate(PluginCall call) {
        String text = call.getString("text", "").trim();
        String sourceLang = LANGUAGE_CODES.containsKey(call.getString("sourceLang", "eng_Latn"))
            ? call.getString("sourceLang", "eng_Latn") : "eng_Latn";
        String targetLang = LANGUAGE_CODES.containsKey(call.getString("targetLang", "kan_Knda"))
            ? call.getString("targetLang", "kan_Knda") : "kan_Knda";

        if (text.isEmpty()) {
            JSObject result = new JSObject();
            result.put("translatedText", "");
            result.put("latencyMs", 0);
            call.resolve(result);
            return;
        }

        long start = System.currentTimeMillis();
        try {
            ensureLoaded();
            List<Integer> sourceIds = tokenize(text, sourceLang);
            long[] inputIds = new long[sourceIds.size()];
            long[] attention = new long[sourceIds.size()];
            for (int i = 0; i < sourceIds.size(); i++) {
                inputIds[i] = sourceIds.get(i);
                attention[i] = 1;
            }

            OrtSession.Result encoderResult;
            Map<String, OnnxTensor> encoderInputs = new HashMap<>();
            for (String name : encoderSession.getInputNames()) {
                if (name.contains("attention") || name.contains("mask")) {
                    encoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{attention}));
                } else {
                    encoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{inputIds}));
                }
            }
            try {
                encoderResult = encoderSession.run(encoderInputs);
            } finally {
                for (OnnxTensor tensor : encoderInputs.values()) tensor.close();
            }

            OnnxTensor encoderHidden = null;
            for (Map.Entry<String, ai.onnxruntime.OnnxValue> entry : encoderResult) {
                ai.onnxruntime.OnnxValue value = entry.getValue();
                if (value instanceof OnnxTensor) {
                    encoderHidden = (OnnxTensor) value;
                    break;
                }
            }
            if (encoderHidden == null) throw new IllegalStateException("Encoder did not produce hidden states");

            int targetId = getTokenId(targetLang, 256200);
            List<Integer> generated = new ArrayList<>();
            generated.add(targetId);

            for (int step = 0; step < 128; step++) {
                long[] decoderIds = new long[generated.size()];
                for (int i = 0; i < generated.size(); i++) decoderIds[i] = generated.get(i);

                Map<String, OnnxTensor> decoderInputs = new HashMap<>();
                for (String name : decoderSession.getInputNames()) {
                    String lower = name.toLowerCase();
                    if (lower.contains("encoder") && lower.contains("hidden")) {
                        decoderInputs.put(name, (OnnxTensor) encoderHidden);
                    } else if (lower.contains("encoder") && lower.contains("attention")) {
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{attention}));
                    } else if (lower.contains("input") || lower.contains("ids")) {
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{decoderIds}));
                    } else if (lower.contains("attention") || lower.contains("mask")) {
                        long[] decoderMask = new long[decoderIds.length];
                        for (int i = 0; i < decoderMask.length; i++) decoderMask[i] = 1;
                        decoderInputs.put(name, OnnxTensor.createTensor(environment, new long[][]{decoderMask}));
                    }
                }

                try (OrtSession.Result decoderResult = decoderSession.run(decoderInputs)) {
                    int nextToken = 2;
                    for (Map.Entry<String, ai.onnxruntime.OnnxValue> entry : decoderResult) {
                        ai.onnxruntime.OnnxValue value = entry.getValue();
                        if (!(value instanceof OnnxTensor)) continue;
                        long[] shape = ((OnnxTensor) value).getInfo().getShape();
                        if (shape.length == 3) {
                            java.nio.FloatBuffer buffer = ((OnnxTensor) value).getFloatBuffer();
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
                        }
                        break;
                    }
                    if (nextToken == 2 || nextToken == 0) break;
                    generated.add(nextToken);
                } finally {
                    for (Map.Entry<String, OnnxTensor> input : decoderInputs.entrySet()) {
                        if (input.getValue() != encoderHidden) input.getValue().close();
                    }
                }
            }

            encoderResult.close();
            encoderHidden.close();
            String translated = decode(generated);

            JSObject result = new JSObject();
            result.put("translatedText", translated);
            result.put("latencyMs", System.currentTimeMillis() - start);
            call.resolve(result);
        } catch (OrtException error) {
            call.reject("NLLB_ONNX_ERROR", error);
        } catch (Exception error) {
            call.reject("NLLB_ONNX_ERROR", error);
        }
    }
}
