package com.payment;

import com.payment.simulator.MockProcessorServer;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PaymentGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentGatewayApplication.class, args);

    }
    @Bean
    CommandLineRunner startMockProcessor() {
        return args -> {
            Thread processorThread = new Thread(
                    () -> new MockProcessorServer(9876).start()
            );

            processorThread.setName("mock-processor");
            processorThread.start();
        };
    }
}
