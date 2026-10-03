package rag_langchain4j.controller;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.web.bind.annotation.*;
import rag_langchain4j.util.PromptLoader;

@RestController
@RequestMapping("/api/job")
@CrossOrigin("*")
public class JobController {

    private final ChatLanguageModel chatModel;
    private final PromptLoader promptLoader;


    public JobController(ChatLanguageModel chatModel,
                         PromptLoader promptLoader,
                         CvService cvService, LatexPdfService latexPdfService) {
        this.chatModel = chatModel;
        this.promptLoader = promptLoader;
    }



}