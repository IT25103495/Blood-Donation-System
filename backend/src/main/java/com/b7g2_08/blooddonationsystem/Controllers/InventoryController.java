package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryStatusDTO;
import com.b7g2_08.blooddonationsystem.Models.Inventory;
import com.b7g2_08.blooddonationsystem.Repos.InventoryRepository;
import com.b7g2_08.blooddonationsystem.Services.InventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/Inventory")
public class InventoryController {
    @Autowired
    private InventoryRepository inventoryRepo;
    @Autowired
    private InventoryService inventoryService;

    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @PostMapping(path="/add")
    public @ResponseBody String addNewInventory(@RequestBody inventoryCreateDTO item) {
        return inventoryService.addNewInventory(item);
    }

    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @GetMapping(path="/getAll")
    public @ResponseBody Iterable<Inventory> getInventory() {
        return inventoryRepo.findAll();
    }

    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @GetMapping(path="/getAvailable")
    public @ResponseBody Iterable<Inventory> getAvailableInventory() {
        return inventoryRepo.findAllAvailable();
    }

    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @GetMapping(path="/getById")
    public @ResponseBody ResponseEntity<Inventory> getItemByID(@RequestParam int ID) {
        return inventoryRepo.findById(ID)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @GetMapping(path="/getByBankId")
    public @ResponseBody Iterable<Inventory> getInventoryByBankID(@RequestParam int ID) {
        return inventoryRepo.findAllByBankID(ID);
    }
    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @GetMapping(path="/getAvailableByBankId")
    public @ResponseBody Iterable<Inventory> getAvailableInventoryByBankID(@RequestParam int ID) {
        return inventoryRepo.findAllAvailableByBankID(ID);
    }

    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @PutMapping(path="/updateStatus")
    public @ResponseBody String updateStatus(@RequestBody inventoryStatusDTO status) {
        return inventoryService.updateStatus(status);
    }

    @PreAuthorize("hasRole('SYSADMIN')")
    @DeleteMapping(path="/delete")
    public @ResponseBody String deleteItem(@RequestParam int ID) {
        return inventoryService.deleteItem(ID);
    }
}
