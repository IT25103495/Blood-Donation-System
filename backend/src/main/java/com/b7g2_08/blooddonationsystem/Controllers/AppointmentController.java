package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentResponseDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentStatusUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentUpdateDTO;
import com.b7g2_08.blooddonationsystem.Enums.appStatus;
import com.b7g2_08.blooddonationsystem.Services.AppointmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    //create appointment
    @PreAuthorize("hasAnyRole('DONOR','SYSADMIN')")
    @PostMapping()
    public @ResponseBody String addAppointment(@RequestBody appointmentCreateDTO appointmentCreateDTO, @AuthenticationPrincipal AuthEntity me) {

        return appointmentService.addNewAppointment(appointmentCreateDTO, me);
    }

    // view all appointments
    @PreAuthorize("hasAnyRole('SYSADMIN','DOCTOR')")
    @GetMapping()
    public @ResponseBody List<appointmentResponseDTO> getAllAppointments() {

        return appointmentService.getAllAppointments();
    }

    //view appointment by id
    @PreAuthorize("hasAnyRole('SYSADMIN','DOCTOR')")
    @GetMapping("/{id}")
    public @ResponseBody appointmentResponseDTO getAppointmentById(@PathVariable int id) {
        return appointmentService.getAppointmentById(id);
    }

    //update appointment
    @PreAuthorize("hasAnyRole('SYSADMIN','DOCTOR')")
    @PutMapping("/{id}")
    public @ResponseBody String updateAppointment(@PathVariable int id,@RequestBody appointmentUpdateDTO appointmentUpdateDTO) {
        return appointmentService.updateAppointment(id, appointmentUpdateDTO);
    }

    //update appointment status
    @PreAuthorize("hasAnyRole('SYSADMIN','DOCTOR')")
    @PostMapping("/{id}/status")
    public @ResponseBody String updateAppointmentStatus(@PathVariable int id,@RequestBody appointmentStatusUpdateDTO status) {
        return appointmentService.updateAppointmentStatus(id, status);
    }

    //delete appointment
    @PreAuthorize("hasRole('SYSADMIN')")
    @DeleteMapping("/{id}")
    public @ResponseBody String deleteAppointment(@PathVariable int id) {
        return appointmentService.deleteAppointment(id);
    }

    //a donor calling off their own booking
    @PreAuthorize("hasRole('DONOR')")
    @PostMapping("/me/{id}/cancel")
    public @ResponseBody String cancelMyAppointment(@PathVariable int id, @AuthenticationPrincipal AuthEntity me) {
        return appointmentService.cancelOwnAppointment(id, me);
    }

    @PreAuthorize("hasRole('DONOR')")
    @GetMapping("/donor/{donor_id}")
    public @ResponseBody List<appointmentResponseDTO> getUserAppointments(@PathVariable int donor_id) {
        return appointmentService.getAppointmentsByDonor(donor_id);
    }

}
