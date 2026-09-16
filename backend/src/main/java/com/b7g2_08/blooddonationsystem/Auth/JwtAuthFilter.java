package com.b7g2_08.blooddonationsystem.Auth;

import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@Profile("!dev")
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthEntityRepository authEntityRepository;

    @Override
    @NullMarked
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        // Clear context
        SecurityContextHolder.clearContext();

        // Get authorization header
        String authHeader = request.getHeader("Authorization");

        // No token, pass through filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        // Invalid token
        if (!jwtUtil.validateToken(token)) {
            httpUnauthorize(response);
            return;
        }

        // Email and AuthEntity
        String username = jwtUtil.extractUsername(token);
        Optional<AuthEntity> opAuthEntity = authEntityRepository.findByUsername(username);

        // Email not registered
        if (opAuthEntity.isEmpty()) {
            httpUnauthorize(response);
        }

        // Authorized
        else {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            opAuthEntity.get(),
                            null,
                            opAuthEntity.get().getAuthorities()
                    );

            // Generate new context, may not be required now
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            chain.doFilter(request, response);
        }
    }

    private void httpUnauthorize(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Unauthorized");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        return path.equals("/auth/login") ||
                path.equals("/auth/register") ||
                path.startsWith("/api/admin") ||
                path.startsWith("/h2-console") ||
                path.startsWith("/v3/api-docs/") ||
                path.startsWith("/swagger-ui/") ||
                path.startsWith("/swagger-ui.html") ||
                (path.equals("/api/campaigns/public") && method.equals("GET"));
    }
}
