package com.b7g2_08.blooddonationsystem.Repos;

import com.b7g2_08.blooddonationsystem.Models.Inventory;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends CrudRepository<Inventory, Integer> {
    Optional<Inventory> findByAppointment_AppID(Integer appID);

    @Query(value = "SELECT * FROM Inventory WHERE BankID = :bankID", nativeQuery = true)
    List<Inventory> findAllByBankID(@Param("bankID") Integer bankID);

    @Query(value = "SELECT * FROM Inventory WHERE Status = 0", nativeQuery = true)
    List<Inventory> findAllAvailable();

    @Query(value = "SELECT * FROM Inventory WHERE BankID = :bankID AND Status = 0", nativeQuery = true)
    List<Inventory> findAllAvailableByBankID(@Param("bankID") Integer bankID);
}
