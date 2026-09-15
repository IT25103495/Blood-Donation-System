package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Venue.venueCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Venue.venueUpdateDTO;
import com.b7g2_08.blooddonationsystem.Enums.itemStatus;
import com.b7g2_08.blooddonationsystem.Models.Bank;
import com.b7g2_08.blooddonationsystem.Models.Venue;
import com.b7g2_08.blooddonationsystem.Repos.BankRepository;
import com.b7g2_08.blooddonationsystem.Repos.VenueRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VenueService {
    @Autowired
    VenueRepository venueRepo;
    @Autowired
    private BankRepository bankRepo;

    @Transactional
    public @ResponseBody String addNewVenue(venueCreateDTO _venue) {
        Venue venue = new Venue();

        Bank bank = bankRepo.findById(_venue.getBankID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank Not Found!"));

        venue.setName(_venue.getName());
        venue.setAddress(_venue.getAddress());
        venue.setAssignedBank(bank);

        venueRepo.save(venue);
        return "Saved";
    }

    //FIXME: Update the DTO and this method so unset values don't get replaced
    @Transactional
    public @ResponseBody String updateVenue(venueUpdateDTO _venue) {
        Venue venue = venueRepo.findById(_venue.getVenueID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found!"));

        Bank bank = bankRepo.findById(_venue.getBankID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank Not Found!"));

        venue.setName(_venue.getName());
        venue.setAddress(_venue.getAddress());
        venue.setAssignedBank(bank);

        venueRepo.save(venue);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String deleteVenue(int ID) {
        if (venueRepo.existsById(ID)) {
            venueRepo.deleteById(ID);
            return "Deleted";
        }
        else return "Not Found";
    }
}
