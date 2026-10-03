package rag_langchain4j.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import rag_langchain4j.client.OrchestratorClient;
import rag_langchain4j.dto.ChatRequest;
import rag_langchain4j.dto.ChatResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chat")
@Validated
@Slf4j
public class ChatController {

    private final OrchestratorClient orchestratorClient;

    public ChatController(OrchestratorClient orchestratorClient) {
        this.orchestratorClient = orchestratorClient;
    }

    @PostMapping
    public Mono<ResponseEntity<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        log.info("Chat request from user={} len={}", userId, request.message().length());

        return orchestratorClient.orchestrate(request)
                .map(ResponseEntity::ok);
    }

    /** SSE endpoint for streaming responses */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chatStream(
            @Valid @RequestBody ChatRequest request) {

        return orchestratorClient.orchestrateStream(request)
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build())
                .concatWith(Flux.just(
                        ServerSentEvent.<String>builder()
                                .event("done")
                                .data("[DONE]")
                                .build()
                ));
    }
}