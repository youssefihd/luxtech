package rag_langchain4j.entities;

import java.util.List;

public record RagResponse(String context, List<ChunkResult> chunks) {}
