package com.luxtech.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;

@Component
@Slf4j
public class JwtAuthFilter extends
        AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Value("${jwt.secret}")
    private String secret;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            String authHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                Claims claims = Jwts.parser()
                        .verifyWith(getSigningKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                ServerWebExchange mutated = exchange.mutate()
                        .request(r -> r
                                .headers(headers -> {
                                    headers.remove("X-User-Id");
                                    headers.remove("X-User-Role");
                                    headers.remove("X-User-Email");
                                    headers.remove("X-User-Nom");
                                    headers.remove("X-Agency-Id");
                                    headers.remove("X-Hotel-Id");
                                    headers.add("X-User-Id", claims.getSubject());
                                    headers.add("X-User-Role", claims.get("role", String.class) != null
                                            ? claims.get("role", String.class) : "");
                                    headers.add("X-User-Email", claims.get("email", String.class) != null
                                            ? claims.get("email", String.class) : "");
                                    headers.add("X-User-Nom", claims.get("nom", String.class) != null
                                            ? claims.get("nom", String.class) : "");
                                    Object agencyId = claims.get("agencyId");
                                    if (agencyId != null) headers.add("X-Agency-Id", agencyId.toString());
                                    Object hotelId = claims.get("hotelId");
                                    if (hotelId != null) headers.add("X-Hotel-Id", hotelId.toString());
                                }))
                        .build();

                return chain.filter(mutated);

            } catch (Exception e) {
                log.warn("Token JWT invalide : {}", e.getMessage());
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public static class Config {}
}
