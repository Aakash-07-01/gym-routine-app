package com.gymroutine.backend.ai.circuit;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CircuitBreakerRegistry {
    private static final int FAILURE_THRESHOLD = 3;
    private static final int COOLDOWN_MINUTES = 10;
    
    private final Map<String, ProviderState> states = new ConcurrentHashMap<>();

    public void recordSuccess(String provider) {
        states.compute(provider, (k, state) -> {
            if (state == null) {
                return new ProviderState(0, null, LocalDateTime.now(), false, null);
            }
            state.failureCount = 0;
            state.lastSuccessAt = LocalDateTime.now();
            state.isCircuitOpen = false;
            state.circuitOpenUntil = null;
            return state;
        });
    }

    public void recordFailure(String provider) {
        states.compute(provider, (k, state) -> {
            if (state == null) {
                state = new ProviderState(0, null, null, false, null);
            }
            state.failureCount++;
            state.lastFailureAt = LocalDateTime.now();
            
            if (state.failureCount >= FAILURE_THRESHOLD) {
                state.isCircuitOpen = true;
                state.circuitOpenUntil = LocalDateTime.now().plusMinutes(COOLDOWN_MINUTES);
            }
            return state;
        });
    }

    public boolean isOpen(String provider) {
        ProviderState state = states.get(provider);
        if (state == null) return false;
        
        if (state.isCircuitOpen) {
            // Check if cooldown has expired (half-open state)
            if (LocalDateTime.now().isAfter(state.circuitOpenUntil)) {
                return false;
            }
            return true;
        }
        return false;
    }

    public Map<String, ProviderState> getAllStates() {
        return Map.copyOf(states); // Return a read-only copy
    }

    public void clear() {
        states.clear();
    }

    public static class ProviderState {
        private int failureCount;
        private LocalDateTime lastFailureAt;
        private LocalDateTime lastSuccessAt;
        private boolean isCircuitOpen;
        private LocalDateTime circuitOpenUntil;

        public ProviderState(int failureCount, LocalDateTime lastFailureAt, LocalDateTime lastSuccessAt, 
                             boolean isCircuitOpen, LocalDateTime circuitOpenUntil) {
            this.failureCount = failureCount;
            this.lastFailureAt = lastFailureAt;
            this.lastSuccessAt = lastSuccessAt;
            this.isCircuitOpen = isCircuitOpen;
            this.circuitOpenUntil = circuitOpenUntil;
        }

        public int getFailureCount() { return failureCount; }
        public LocalDateTime getLastFailureAt() { return lastFailureAt; }
        public LocalDateTime getLastSuccessAt() { return lastSuccessAt; }
        public boolean isCircuitOpen() { return isCircuitOpen; }
        public LocalDateTime getCircuitOpenUntil() { return circuitOpenUntil; }
    }
}
