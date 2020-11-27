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
                        name: {
                            rule: "required",
                            type: "string",
                            id: 3,
                        },
                        location: {
                            rule: "required",
                            type: "string",
                            id: 4,
                        },
                        room: {
                            rule: "required",
                            type: "string",
                            id: 5,
                        },
                        venueType: {
                            rule: "required",
                            type: "VenueType",
                            id: 6,
                        },
                        notificationKey: {
                            rule: "required",
                            type: "bytes",
                            id: 7,
                        },
                        validFrom: {
                            rule: "optional",
                            type: "uint64",
                            id: 8,
                        },
                        validTo: {
                            rule: "optional",
                            type: "uint64",
                            id: 9,
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
                        content: {
                            rule: "required",
                            type: "QRCodeContent",
                            id: 2,
                        },
                        signature: {
                            rule: "required",
                            type: "bytes",
                            id: 3,
                        },
                    },
                },
            },
        },
    },
};
