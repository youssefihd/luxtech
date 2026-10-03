package rag_langchain4j.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "Message cannot be blank")
        @Size(max = 4000, message = "Message too long")
        String message,

        @Size(max = 50)
        String conversationId
) {}