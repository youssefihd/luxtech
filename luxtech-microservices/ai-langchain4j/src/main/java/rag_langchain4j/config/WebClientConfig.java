package rag_langchain4j.config;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.netty.http.client.HttpClient; // ✅ correctimport java.time.Duration;

import java.time.Duration;

@Configuration
public class WebClientConfig {


        @Bean
        public WebClient orchestratorWebClient(
                @Value("${app.orchestrator.base-url}") String baseUrl) {
            return WebClient.builder()
                    .baseUrl(baseUrl)
                    .build();
        }
    }
