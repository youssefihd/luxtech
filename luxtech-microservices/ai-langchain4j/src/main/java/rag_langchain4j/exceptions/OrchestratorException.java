package rag_langchain4j.exceptions;

public class OrchestratorException extends RuntimeException {

    public OrchestratorException(String message) {
        super(message);
    }

    public OrchestratorException(String message, Throwable cause) {
        super(message, cause);
    }
}