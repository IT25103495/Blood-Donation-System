package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentResponseDTO;
import com.b7g2_08.blooddonationsystem.Enums.appStatus;
import com.b7g2_08.blooddonationsystem.Models.Appointment;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.b7g2_08.blooddonationsystem.Models.Venue;
import com.b7g2_08.blooddonationsystem.Repos.AppointmentRepository;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.DonorUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.VenueRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {


    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private CampaignRepository campaignRepository;
    @Autowired
    private DonorUserRepository donorUserRepository;
    @Autowired
    private VenueRepository venueRepository;

    @Transactional
    public @ResponseBody String addNewAppointment(appointmentCreateDTO appointmentCreateDTO) {

        Appointment appointment = new Appointment();

        Campaign campaign = campaignRepository.findById(appointmentCreateDTO.getCampId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found!"));
        Venue venue = venueRepository.findById(appointmentCreateDTO.getVenueID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found!"));
        Donor donor = donorUserRepository.findById(appointmentCreateDTO.getDonorID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor Not Found!"));

        appointment.setDate(appointmentCreateDTO.getDate());
        appointment.setStatus(appStatus.BOOKED);
        appointment.setCampaign(campaign);
        appointment.setDonor(donor);
        appointment.setVenue(venue);
        appointmentRepository.save(appointment);
        return "Saved";

    }

    @Transactional
    public List<appointmentResponseDTO> getAllAppointments() {
        List<appointmentResponseDTO> result = new ArrayList<>();

        for (Appointment appointment : appointmentRepository.findAll()) {
            result.add(new appointmentResponseDTO(appointment));
        }

        return result;
    }

    @Transactional
    public appointmentResponseDTO getAppointmentById(int id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment Not Found!"));

        return new appointmentResponseDTO(appointment);
    }




}
