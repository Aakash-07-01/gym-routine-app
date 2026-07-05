package com.gymroutine.backend.ai;

import com.gymroutine.backend.ai.agent.AiAgentOrchestrator;
import com.gymroutine.backend.ai.circuit.CircuitBreakerRegistry;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "JWT_SECRET_KEY=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    "JWT_EXPIRATION=86400000"
})
@AutoConfigureMockMvc
@Transactional
public class AiAgentTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Autowired
    private AiAgentOrchestrator orchestrator;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        circuitBreakerRegistry.clear();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getProviderHealthStatus_asAdmin_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/ai/provider/status"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void getProviderHealthStatus_asUser_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/ai/provider/status"))
                .andExpect(status().isForbidden());
    }

    @Test
    void circuitBreaker_shouldOpenAfterThreeFailures() {
        String testProvider = "TestProvider";
        
        circuitBreakerRegistry.recordFailure(testProvider);
        assertThat(circuitBreakerRegistry.isOpen(testProvider)).isFalse(); // 1 failure
        
        circuitBreakerRegistry.recordFailure(testProvider);
        assertThat(circuitBreakerRegistry.isOpen(testProvider)).isFalse(); // 2 failures
        
        circuitBreakerRegistry.recordFailure(testProvider);
        assertThat(circuitBreakerRegistry.isOpen(testProvider)).isTrue(); // 3 failures -> OPEN
    }
}
