package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Venue.venueCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Venue.venueUpdateDTO;
import com.b7g2_08.blooddonationsystem.Models.Venue;
import com.b7g2_08.blooddonationsystem.Repos.VenueRepository;
import com.b7g2_08.blooddonationsystem.Services.VenueService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/Venue")
public class VenueController {
    @Autowired
    VenueRepository venueRepo;
    @Autowired
    VenueService venueService;

    @PreAuthorize("hasRole('SYSADMIN')")
    @PostMapping(path="/add")
    public @ResponseBody String addNewVenue(@RequestBody venueCreateDTO venue) {
        return venueService.addNewVenue(venue);
    }

    @PreAuthorize("hasRole('SYSADMIN')")
    @PutMapping(path="/update")
    public @ResponseBody String updateVenue(@RequestBody venueUpdateDTO venue) {
        return venueService.updateVenue(venue);
    }

    @GetMapping(path="/getAll")
    public @ResponseBody Iterable<Venue> getVenues() {
        return venueRepo.findAll();
    }

    @GetMapping(path="/getById")
    public @ResponseBody ResponseEntity<Venue> getVenueByID(@RequestParam int ID) {
        return venueRepo.findById(ID)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('SYSADMIN')")
    @DeleteMapping(path="/delete")
    public @ResponseBody String deleteVenue(@RequestParam int ID) {
        return venueService.deleteVenue(ID);
    }
}
