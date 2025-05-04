package com.example.portal.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class ServiceAppointment implements Serializable {
    private Integer appointmentId;
    private Integer custId;
    private Integer serviceId;
    private Integer outletId;
    private Integer timeId;
    private Integer vehId;
    private Integer staffId;
    private BigDecimal appointmentCost;
    private Integer appointmentDuration;
    private String appointmentStatus;

    @JsonFormat(pattern = "HH:mm:ss")
    @JsonSerialize(using = LocalTimeSerializer.class)
    @JsonDeserialize(using = LocalTimeDeserializer.class)
    private LocalTime estimatedFinishTime;

    // Relationships
    private Customer customer;
    private Object service; // Using Object to handle both ServiceType and LinkedHashMap
    private Object outlet; // Using Object to handle both ServiceOutlet and LinkedHashMap
    private TimeSlot timeSlot;
    private Vehicle vehicle;
    private Staff staff;

    /**
     * Get the service type safely, handling the case when it's a LinkedHashMap
     * @return The ServiceType object or null if not available
     */
    public ServiceType getServiceTypeSafe() {
        if (service == null) {
            return null;
        }

        if (service instanceof ServiceType) {
            return (ServiceType) service;
        }

        if (service instanceof java.util.Map) {
            try {
                // Create a new ServiceType from the map
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> serviceMap = (java.util.Map<String, Object>) service;

                ServiceType serviceType = new ServiceType();

                if (serviceMap.containsKey("serviceId")) {
                    Object idObj = serviceMap.get("serviceId");
                    if (idObj instanceof Number) {
                        serviceType.setServiceId(((Number) idObj).intValue());
                    }
                }

                if (serviceMap.containsKey("serviceType")) {
                    Object typeObj = serviceMap.get("serviceType");
                    if (typeObj != null) {
                        serviceType.setServiceType(typeObj.toString());
                    }
                }

                if (serviceMap.containsKey("serviceDesc")) {
                    Object descObj = serviceMap.get("serviceDesc");
                    if (descObj != null) {
                        serviceType.setServiceDesc(descObj.toString());
                    }
                }

                if (serviceMap.containsKey("serviceCategory")) {
                    Object catObj = serviceMap.get("serviceCategory");
                    if (catObj != null) {
                        serviceType.setServiceCategory(catObj.toString());
                    }
                }

                if (serviceMap.containsKey("servicePrice")) {
                    Object priceObj = serviceMap.get("servicePrice");
                    if (priceObj instanceof Number) {
                        serviceType.setServicePrice(((Number) priceObj).doubleValue());
                    }
                }

                if (serviceMap.containsKey("serviceDuration")) {
                    Object durationObj = serviceMap.get("serviceDuration");
                    if (durationObj instanceof Number) {
                        serviceType.setServiceDuration(((Number) durationObj).intValue());
                    }
                }

                return serviceType;
            } catch (Exception e) {
                // If anything goes wrong, return null
                return null;
            }
        }

        return null;
    }

    /**
     * Get the service outlet safely, handling the case when it's a LinkedHashMap
     * @return The ServiceOutlet object or null if not available
     */
    public ServiceOutlet getOutletSafe() {
        if (outlet == null) {
            return null;
        }

        if (outlet instanceof ServiceOutlet) {
            return (ServiceOutlet) outlet;
        }

        if (outlet instanceof java.util.Map) {
            try {
                // Create a new ServiceOutlet from the map
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> outletMap = (java.util.Map<String, Object>) outlet;

                ServiceOutlet serviceOutlet = new ServiceOutlet();

                if (outletMap.containsKey("outletId")) {
                    Object idObj = outletMap.get("outletId");
                    if (idObj instanceof Number) {
                        serviceOutlet.setOutletId(((Number) idObj).intValue());
                    }
                }

                if (outletMap.containsKey("outletName")) {
                    Object nameObj = outletMap.get("outletName");
                    if (nameObj != null) {
                        serviceOutlet.setOutletName(nameObj.toString());
                    }
                }

                if (outletMap.containsKey("outletAddress")) {
                    Object addrObj = outletMap.get("outletAddress");
                    if (addrObj != null) {
                        serviceOutlet.setOutletAddress(addrObj.toString());
                    }
                }

                if (outletMap.containsKey("outletCity")) {
                    Object cityObj = outletMap.get("outletCity");
                    if (cityObj != null) {
                        serviceOutlet.setOutletCity(cityObj.toString());
                    }
                }

                if (outletMap.containsKey("outletState")) {
                    Object stateObj = outletMap.get("outletState");
                    if (stateObj != null) {
                        serviceOutlet.setOutletState(stateObj.toString());
                    }
                }

                if (outletMap.containsKey("outletPostalCode")) {
                    Object postalObj = outletMap.get("outletPostalCode");
                    if (postalObj != null) {
                        serviceOutlet.setOutletPostalCode(postalObj.toString());
                    }
                }

                return serviceOutlet;
            } catch (Exception e) {
                // If anything goes wrong, return null
                return null;
            }
        }

        return null;
    }
}
