package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryStatusDTO;
import com.b7g2_08.blooddonationsystem.Enums.bloodTypeList;
import com.b7g2_08.blooddonationsystem.Enums.itemStatus;
import com.b7g2_08.blooddonationsystem.Models.Appointment;
import com.b7g2_08.blooddonationsystem.Models.Bank;
import com.b7g2_08.blooddonationsystem.Models.Inventory;
import com.b7g2_08.blooddonationsystem.Repos.AppointmentRepository;
import com.b7g2_08.blooddonationsystem.Repos.BankRepository;
import com.b7g2_08.blooddonationsystem.Repos.InventoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventoryService {
    @Autowired
    private InventoryRepository inventoryRepo;
    @Autowired
    private AppointmentRepository appointmentRepo;
    @Autowired
    private BankRepository bankRepo;

    //TODO: When 'DOCTOR' admins log in and set an appointment to 'completed' it should run this method with the necessary data automatically - will need another method to do that
    @Transactional
    public @ResponseBody String addNewInventory(inventoryCreateDTO _item) {
        checkBloodType(_item.getBloodType());
        Inventory item = new Inventory();

        //Fetches the appointment and bank objects by the IDs provided in the DTO
        Appointment appointment = appointmentRepo.findById(_item.getAppointmentID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment Not Found!"));

        // One appointment yields one unit, and the appID column is unique because of the @OneToOne.
        // Checked here so the caller is told which unit already exists instead of getting the
        // generic "duplicate value" conflict the database constraint produces.
        inventoryRepo.findByAppointment_AppID(appointment.getAppID()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Appointment " + appointment.getAppID() + " already has inventory unit #" + existing.getItemID() + " recorded against it.");
        });

        Bank bank = bankRepo.findById(_item.getBankID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank Not Found!"));

        item.setAppointment(appointment);
        item.setBank(bank);
        item.setBloodType(_item.getBloodType());
        item.setStatus(itemStatus.AVAILABLE);
        item.setDateCollected(appointment.getDate());

        inventoryRepo.save(item);
        return "Saved";
    }

    @Transactional
    public @ResponseBody String updateStatus(inventoryStatusDTO _status) {
        Inventory item = inventoryRepo.findById(_status.getItemID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item Not Found!"));
        item.setStatus(_status.getStatus());

        inventoryRepo.save(item);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String deleteItem(int ID) {
        Inventory item = inventoryRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item Not Found!"));
        Appointment appointment = item.getAppointment();
        appointment.setItem(null);
        appointmentRepo.save(appointment);
        inventoryRepo.deleteById(ID);
        return "Deleted";
    }

    private void checkBloodType(String bloodType) {
        if (!bloodTypeList.list.contains(bloodType))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Blood Type");
    }
}
