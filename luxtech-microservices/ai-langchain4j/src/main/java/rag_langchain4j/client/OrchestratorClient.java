package rag_langchain4j.client;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import rag_langchain4j.dto.ChatRequest;
import rag_langchain4j.dto.ChatResponse;
import rag_langchain4j.exceptions.OrchestratorException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class OrchestratorClient {

    private final WebClient client;

    // OrchestratorClient.java
    public OrchestratorClient(@Qualifier("orchestratorWebClient") WebClient client) {
        this.client = client;
    }
    @PostConstruct
    public void init() {
        System.out.println("OrchestratorClient LOADED");
    }
    public Mono<ChatResponse> orchestrate(ChatRequest request) {
        return client.post()
                .uri("/orchestrate")
                .bodyValue(Map.of(
                        "query", request.message(),
                        "conversation_id", Optional.ofNullable(request.conversationId()).orElse("")
                ))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, resp ->
                        resp.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(new OrchestratorException("Client error: " + body))))
                .onStatus(HttpStatusCode::is5xxServerError, resp ->
                        Mono.error(new OrchestratorException("Orchestrator unavailable")))
                .bodyToMono(ChatResponse.class)
                .timeout(Duration.ofSeconds(55))
                .doOnError(e -> log.error("Orchestrator call failed", e));
    }

    /** SSE streaming variant — if you want token-by-token streaming */
    public Flux<String> orchestrateStream(ChatRequest request) {
        return client.post()
                .uri("/orchestrate/stream")
                .bodyValue(Map.of("query", request.message()))
                .retrieve()
                .bodyToFlux(String.class);
    }
}