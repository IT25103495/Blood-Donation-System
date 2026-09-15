package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Venue.venueCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Inventory;
import com.b7g2_08.blooddonationsystem.Models.Venue;
import com.b7g2_08.blooddonationsystem.Repos.VenueRepository;
import com.b7g2_08.blooddonationsystem.Services.VenueService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping(path="/add")
    public @ResponseBody String addNewVenue(@RequestBody venueCreateDTO venue) {
        return venueService.addNewVenue(venue);
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

    @DeleteMapping(path="/delete")
    public @ResponseBody String deleteVenue(@RequestParam int ID) {
        return venueService.deleteVenue(ID);
    }
}
