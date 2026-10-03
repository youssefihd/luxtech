package rag_langchain4j.entities;

public record RagRequest(String query, int topK) {}