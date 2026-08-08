package ma.lbledfirst.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;

@Service
public class TranslationService {

    private static final Logger log = LoggerFactory.getLogger(TranslationService.class);
    private static final String CHAT_URL = "https://api.openai.com/v1/chat/completions";

    // code -> full name Whisper/GPT understands unambiguously
    public static final Map<String, String> TARGET_LANGUAGES = new LinkedHashMap<>();
    static {
        TARGET_LANGUAGES.put("en", "English");
        TARGET_LANGUAGES.put("zh", "Mandarin Chinese");
        TARGET_LANGUAGES.put("tr", "Turkish");
        TARGET_LANGUAGES.put("es", "Spanish");
        TARGET_LANGUAGES.put("fr", "French");
        TARGET_LANGUAGES.put("de", "German");
        TARGET_LANGUAGES.put("nl", "Dutch");
        TARGET_LANGUAGES.put("pt", "Portuguese");
    }

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model-translation}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Translates originalText into every target language except the original one.
     * Returns a map of languageCode -> translatedText.
     */
    public Map<String, String> translateToAll(String originalText, String originalLanguageCode)
            throws IOException, InterruptedException {
        Map<String, String> result = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : TARGET_LANGUAGES.entrySet()) {
            String code = entry.getKey();
            String name = entry.getValue();
            if (code.equalsIgnoreCase(originalLanguageCode)) {
                // Skip re-translating into its own original language — saves API cost.
                result.put(code, originalText);
                continue;
            }
            result.put(code, translate(originalText, name));
        }
        return result;
    }

    public String translate(String originalText, String targetLanguage) throws IOException, InterruptedException {
        String systemPrompt = "You are a professional translator. Translate the user's text into "
                + targetLanguage + ". Return ONLY the translation, no explanations, no quotes.";

        String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "messages", new Object[] {
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", originalText)
                },
                "temperature", 0.3));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CHAT_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        log.info("Envoi du texte à traduire vers {}", targetLanguage);
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Traduction échouée ({}): {}", response.statusCode(), response.body());
            throw new RuntimeException("OpenAI API error " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    public List<String> translateBatch(List<String> originalTexts, String targetLanguage)
            throws IOException, InterruptedException {
        if (originalTexts.isEmpty()) {
            return List.of();
        }

        String systemPrompt = "You are a professional translator. You will receive a JSON array of strings. "
                + "Translate EACH string into " + targetLanguage + ". "
                + "Return ONLY a valid JSON array of the translated strings, in the exact same order, "
                + "with exactly the same number of elements as the input. No explanations, no markdown, no code fences.";

        String userContent = objectMapper.writeValueAsString(originalTexts);

        String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "messages", new Object[] {
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userContent)
                },
                "temperature", 0.3));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CHAT_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        log.info("Envoi de {} segment(s) à traduire vers {}", originalTexts.size(), targetLanguage);
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Traduction par lot échouée ({}): {}", response.statusCode(), response.body());
            throw new RuntimeException("OpenAI API error " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        // GPT sometimes wraps JSON in markdown code fences despite instructions — strip
        // defensively.
        String cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```(json)?", "").replaceAll("```$", "").trim();
        }

        List<String> translated = objectMapper.readValue(cleaned, new TypeReference<List<String>>() {
        });

        if (translated.size() != originalTexts.size()) {
            log.warn("Traduction par lot : {} segments attendus, {} reçus — possible désalignement",
                    originalTexts.size(), translated.size());
        }

        return translated;
    }
}