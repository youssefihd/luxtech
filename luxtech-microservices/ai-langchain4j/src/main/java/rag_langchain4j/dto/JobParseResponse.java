package rag_langchain4j.dto;

import java.util.List;

public record JobParseResponse(
        String title,
        String company,
        String location,
        List<String> requiredSkills,
        List<String> responsibilities,
        String seniorityLevel
) {}