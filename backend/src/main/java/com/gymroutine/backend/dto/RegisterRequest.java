package com.gymroutine.backend.dto;

public class RegisterRequest {
    private String username;
    private String password;

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public static class RegisterRequestBuilder {
        private String username;
        private String password;

        public RegisterRequestBuilder username(String username) {
            this.username = username;
            return this;
        }

        public RegisterRequestBuilder password(String password) {
            this.password = password;
            return this;
        }

        public RegisterRequest build() {
            RegisterRequest r = new RegisterRequest();
            r.username = this.username;
            r.password = this.password;
            return r;
        }
    }
}
