package com.luxtech.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "agency-service")
public interface AgencyClient {

    @GetMapping("/api/agence/{id}")
    AgencyApiResponse getById(@PathVariable("id") Long id);
}
