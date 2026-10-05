package com.b7g2_08.blooddonationsystem.Repos;

import com.b7g2_08.blooddonationsystem.Models.Request;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface RequestRepository extends CrudRepository<Request, Integer>{
    List<Request> findByHospital_ID(Integer hospitalID);
}
