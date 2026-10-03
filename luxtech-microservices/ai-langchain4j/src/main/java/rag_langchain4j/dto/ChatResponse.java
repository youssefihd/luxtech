package rag_langchain4j.dto;

import java.util.List;

public record ChatResponse(
        String answer,
        List<Source> sources,
        String conversationId
) {
    public record Source(String content, String file, double score) {}
}