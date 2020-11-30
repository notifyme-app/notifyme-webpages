export default {
    nested: {
        qrpackage: {
            nested: {
                VenueType: {
                    values: {
                        OTHER: 0,
                        MEETING_ROOM: 1,
                        CAFETERIA: 2,
                        PRIVATE_EVENT: 3,
                        CANTEEN: 4,
                        LIBRARY: 5,
                        LECTURE_ROOM: 6,
                        SHOP: 7,
                        GYM: 8,
                        KITCHEN_AREA: 9,
                        OFFICE_SPACE: 10,
                    },
                },
                QRCodeContent: {
                    fields: {
                        name: {
                            rule: "required",
                            type: "string",
                            id: 1,
                        },
                        location: {
                            rule: "required",
                            type: "string",
                            id: 2,
                        },
                        room: {
                            rule: "required",
                            type: "string",
                            id: 3,
                        },
                        venueType: {
                            rule: "required",
                            type: "VenueType",
                            id: 4,
                        },
                        notificationKey: {
                            rule: "required",
                            type: "bytes",
                            id: 5,
                        },
                        validFrom: {
                            rule: "optional",
                            type: "uint64",
                            id: 6,
                        },
                        validTo: {
                            rule: "optional",
                            type: "uint64",
                            id: 7,
                        },
                    },
                },
                QRCodeWrapper: {
                    fields: {
                        version: {
                            rule: "required",
                            type: "int32",
                            id: 1,
                        },
                        publicKey: {
                            rule: "required",
                            type: "bytes",
                            id: 2,
                        },
                        r2: {
                            rule: "required",
                            type: "bytes",
                            id: 3,
                        },                                                
                        content: {
                            rule: "required",
                            type: "QRCodeContent",
                            id: 4,
                        },
                    },
                },
                QRCodeTrace: {
                    fields: {
                        version: {
                            rule: "required",
                            type: "int32",
                            id: 1,
                        },
                        r1: {
                            rule: "required",
                            type: "bytes",
                            id: 2,
                        },                        
                        r2: {
                            rule: "required",
                            type: "bytes",
                            id: 3,
                        },                                                
                        content: {
                            rule: "required",
                            type: "QRCodeContent",
                            id: 4,
                        },
                    },
                },                
            },
        },
    },
};
