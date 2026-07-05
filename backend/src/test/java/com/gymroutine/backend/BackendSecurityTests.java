package com.gymroutine.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymroutine.backend.dto.AuthRequest;
import com.gymroutine.backend.dto.WorkoutCompleteRequest;
import com.gymroutine.backend.model.*;
import com.gymroutine.backend.repository.*;
import com.gymroutine.backend.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@org.springframework.test.context.TestPropertySource(properties = {"JWT_SECRET_KEY=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"})
class BackendSecurityTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private SplitRepository splitRepository;
    @Autowired private WorkoutDayRepository dayRepository;
    @Autowired private PRRepository prRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private ObjectMapper objectMapper;

    private User userA;
    private User userB;
    private User adminC;
    private Split splitA;
    private WorkoutDay dayA;
    private String tokenA;
    private String tokenB;
    private String tokenAdmin;

    @BeforeEach
    void setUp() {
        userA = userRepository.save(User.builder().fullName("User A").username("usera").email("usera@example.com").password(passwordEncoder.encode("password123")).role("ROLE_USER").build());
        tokenA = jwtService.generateToken(userA);

        splitA = new Split();
        splitA.setName("User A Split");
        splitA.setUser(userA);
        splitA.setTemplate(false);
        splitA = splitRepository.save(splitA);

        dayA = new WorkoutDay();
        dayA.setDayName("Push");
        dayA.setSplit(splitA);
        dayA = dayRepository.save(dayA);

        userB = userRepository.save(User.builder().fullName("User B").username("userb").email("userb@example.com").password(passwordEncoder.encode("password123")).role("ROLE_USER").build());
        tokenB = jwtService.generateToken(userB);

        adminC = userRepository.save(User.builder().fullName("Admin C").username("testadmin").email("testadmin@example.com").password(passwordEncoder.encode("adminpass")).role("ROLE_ADMIN").build());
        tokenAdmin = jwtService.generateToken(adminC);
    }

    @Test
    void test1_UserAFlow() throws Exception {
        mockMvc.perform(get("/api/dashboard").header("Authorization", "Bearer " + tokenA))
               .andExpect(status().isOk());
    }

    @Test
    void test2_DataIsolation() throws Exception {
        // Test IDOR fix in LogService
        mockMvc.perform(post("/api/logs").param("dayId", String.valueOf(dayA.getId())).header("Authorization", "Bearer " + tokenB))
               .andExpect(status().isForbidden())
               .andExpect(jsonPath("$.error").value("Access denied"));
    }

    @Test
    void test3_UnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
               .andExpect(status().isForbidden());
    }

    @Test
    void test4_TamperedJwt() throws Exception {
        mockMvc.perform(get("/api/dashboard").header("Authorization", "Bearer " + tokenA + "tampered"))
               .andExpect(status().isForbidden());
    }

    @Test
    void test5_AuthEdgeCases() throws Exception {
        AuthRequest req = new AuthRequest();
        req.setUsername("usera");
        req.setPassword("wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void test6_AdminRoleEnforcement() throws Exception {
        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + tokenA))
               .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + tokenAdmin))
               .andExpect(status().isOk());
    }

    @Test
    void test7_PRAutoUpdate() throws Exception {
        WorkoutCompleteRequest req = new WorkoutCompleteRequest();
        req.setDayName("Push");
        WorkoutCompleteRequest.ExerciseStat stat = new WorkoutCompleteRequest.ExerciseStat();
        stat.name = "Bench Press";
        stat.sets = 3;
        stat.reps = 10;
        stat.weight = 100.0;
        req.setExercises(List.of(stat));

        mockMvc.perform(post("/api/workout/complete")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk());

        List<PR> prs = prRepository.findAllByUser(userA);
        assertEquals(1, prs.size());
        assertEquals("Bench Press", prs.get(0).getExerciseName());
        assertEquals(100.0, prs.get(0).getMaxWeight());
    }
}
