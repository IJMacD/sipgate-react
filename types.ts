interface BaseDevice {
    id: string;
    alias: string;
    type: "REGISTER"|"MOBILE"|"EXTERNAL";
    online: boolean;
    dnd: boolean;
    activePhonelines: ActiveRouting[];
    activeGroups: [];
}

interface RegisterDevice extends BaseDevice {
    type: "REGISTER";
    credentials: any;
    registered: RegisteredDevice[];
    emergencyAddressId: string;
    addressUrl: string;
}


interface MobileDevice extends BaseDevice {
    type: "MOBILE";
    credentials: any;
    simState: string;
    esim: boolean;
}

type Device = RegisterDevice | MobileDevice;

interface RegisteredDevice {
    userAgent: string;
    ip: string;
    port: string;
}

interface ActiveRouting {
    id: string;
    alias: string;
}

interface PhoneNumber {
    id: string;
    number: string;
    localized: string;
    type: "LANDLINE";
}

interface PhoneLine {
    id: string;
    alias: string;
    devices?: Device[];
    numbers?: PhoneNumber[];
}