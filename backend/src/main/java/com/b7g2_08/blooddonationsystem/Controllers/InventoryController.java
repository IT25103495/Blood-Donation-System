package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryStatusDTO;
import com.b7g2_08.blooddonationsystem.Models.Inventory;
import com.b7g2_08.blooddonationsystem.Repos.InventoryRepository;
import com.b7g2_08.blooddonationsystem.Services.InventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @PostMapping(path="/add")
    public @ResponseBody String addNewInventory(@RequestBody inventoryCreateDTO item) {
        return inventoryService.addNewInventory(item);
    }

    @GetMapping(path="/getAll")
    public @ResponseBody Iterable<Inventory> getInventory() {
        return inventoryRepo.findAll();
    }

    @GetMapping(path="/getAvailable")
    public @ResponseBody Iterable<Inventory> getAvailableInventory() {
        return inventoryRepo.findAllAvailable();
    }

    @GetMapping(path="/getById")
    public @ResponseBody ResponseEntity<Inventory> getItemByID(@RequestParam int ID) {
        return inventoryRepo.findById(ID)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(path="/getByBankId")
    public @ResponseBody Iterable<Inventory> getInventoryByBankID(@RequestParam int ID) {
        return inventoryRepo.findAllByBankID(ID);
    }
    @GetMapping(path="/getAvailableByBankId")
    public @ResponseBody Iterable<Inventory> getAvailableInventoryByBankID(@RequestParam int ID) {
        return inventoryRepo.findAllAvailableByBankID(ID);
    }

    @PutMapping(path="/updateStatus")
    public @ResponseBody String updateStatus(@RequestBody inventoryStatusDTO status) {
        return inventoryService.updateStatus(status);
    }

    @DeleteMapping(path="/delete")
    public @ResponseBody String deleteItem(@RequestParam int ID) {
        return inventoryService.deleteItem(ID);
    }
}
