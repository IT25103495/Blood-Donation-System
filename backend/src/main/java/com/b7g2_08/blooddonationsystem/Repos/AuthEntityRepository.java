package com.b7g2_08.blooddonationsystem.Repos;

import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

// This will be AUTO IMPLEMENTED by Spring into a Bean called userRepository
// CRUD refers Create, Read, Update, Delete

public interface AuthEntityRepository extends CrudRepository<AuthEntity, Integer> {

    Optional<AuthEntity> findByEmail(String email);
    Optional<AuthEntity> findByUsername(String username);
}