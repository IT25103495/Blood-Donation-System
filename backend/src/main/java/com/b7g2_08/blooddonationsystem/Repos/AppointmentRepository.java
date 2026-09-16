package com.b7g2_08.blooddonationsystem.Repos;

import com.b7g2_08.blooddonationsystem.Models.Appointment;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AppointmentRepository extends CrudRepository<Appointment, Integer> {
    List<Appointment> findByDonor_ID(Integer donorID);
}
