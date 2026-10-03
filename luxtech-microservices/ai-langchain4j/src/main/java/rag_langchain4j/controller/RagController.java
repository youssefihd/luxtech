package rag_langchain4j.controller;


import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.springframework.web.bind.annotation.*;
import rag_langchain4j.entities.ChunkResult;
import rag_langchain4j.entities.RagRequest;
import rag_langchain4j.entities.RagResponse;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> store;
    private final ChatLanguageModel chatModel;


    public RagController(
            EmbeddingModel embeddingModel,
            EmbeddingStore<TextSegment> store,
            ChatLanguageModel chatModel,
            CvService cvService
    ) {
        this.embeddingModel = embeddingModel;
        this.store = store;
        this.chatModel = chatModel;

    }

    // =========================
    // RAG SEARCH
    // =========================
    @PostMapping("/search")
    public RagResponse search(@RequestBody RagRequest request) {

        // 1. Embed query
        Embedding queryEmb = embeddingModel.embed(request.query()).content();

        // 2. Vector search
        List<EmbeddingMatch<TextSegment>> matches =
                store.findRelevant(queryEmb, request.topK());

        // 3. Build context
        String context = matches.stream()
                .map(m -> m.embedded().text())
                .collect(Collectors.joining("\n---\n"));

        // 4. Prompt
        String systemPrompt = "You are a helpful assistant.";
        String userPrompt = "Context:\n" + context +
                "\n\nQuestion:\n" + request.query();

        // 5. LLM response
        String answer = chatModel.generate(
                SystemMessage.from(systemPrompt),
                UserMessage.from(userPrompt)
        ).content().text();

        return new RagResponse(context, toChunkResults(matches));
    }

    private List<ChunkResult> toChunkResults(List<EmbeddingMatch<TextSegment>> matches) {
        return matches.stream()
                .map(m -> new ChunkResult(
                        m.embedded().text(),
                        m.score()
                ))
                .toList();
    }


}