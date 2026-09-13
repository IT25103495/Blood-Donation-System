package com.b7g2_08.blooddonationsystem.Repos.Users;

import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import org.springframework.data.repository.CrudRepository;

// This will be AUTO IMPLEMENTED by Spring into a Bean called userRepository
// CRUD refers Create, Read, Update, Delete

public interface HosterUserRepository extends CrudRepository<Hoster, Integer> {

}