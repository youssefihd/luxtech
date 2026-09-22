package com.luxpure.chatbotservice.controller;


import com.luxpure.chatbotservice.dto.ChatDto;
import com.luxpure.chatbotservice.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/chatbot") @RequiredArgsConstructor
public class ChatbotController {
    private final GeminiService geminiService;

    @PostMapping("/message")
    public ResponseEntity<ChatDto.ApiResponse<ChatDto.ChatResponse>> sendMessage(@RequestBody ChatDto.ChatRequest req) {
        String reply = geminiService.getReply(req.getMessage(), req.getHistory());
        return ResponseEntity.ok(ChatDto.ApiResponse.ok("OK", ChatDto.ChatResponse.builder().reply(reply).build()));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() { return ResponseEntity.ok("chatbot-service UP"); }
}