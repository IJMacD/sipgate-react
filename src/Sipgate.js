const login_url = "https://login.sipgate.com/auth/realms/third-party/protocol/openid-connect/auth";
const client_id = "4195827-0-699c1999-3aa3-11eb-8494-b71f497101a3";
// const redirect_uri = "https://ijmacd.com/sipgate.php";
const redirect_uri = "http://localhost:3000";
const scope = "devices:read sessions:calls:write numbers:read phonelines:read phonelines:numbers:read";
const response_type = "token";

const ACCESS_TOKEN_KEY = "sipgate-react-access-token";

export default class Sipgate {

    /** @type {string} */
    access_token;

    constructor () {
        if (window.location.hash.length) {
            const hashParams = new URLSearchParams(window.location.hash.substr(1));

            if (hashParams.has("access_token")) {
                this.access_token = hashParams.get("access_token");

                localStorage.setItem(ACCESS_TOKEN_KEY, this.access_token);

                window.location.hash = "";

                return;
            }
        }

        this.access_token = localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    logout () {
        this.access_token = null;
        localStorage.removeItem(ACCESS_TOKEN_KEY,)
    }

    isAuthenticated () {
        return this.access_token != null;
    }

    getLoginURL () {
		const params = new URLSearchParams({
			client_id,
			redirect_uri,
			scope,
			response_type,
        });

		return `${login_url}?${params}`;
    }

    /**
     * @returns {Promise<Device[]>}
     */
	async getDevices () {
        const userId = "w0";
		const res = await fetch(`https://api.sipgate.com/v2/${userId}/devices`, {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
        });

        if (!res.ok) {
            this.access_token = null;
            throw Error("Unauthorized");
        }

        const data = await res.json();

        return data.items;
	}

    /**
     * @returns {Promise<PhoneLine[]>}
     */
	async getPhoneLines () {
        const userId = "w0";
		const res = await fetch(`https://api.sipgate.com/v2/${userId}/phonelines`, {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
        });

        if (!res.ok) {
            this.access_token = null;
            throw Error("Unauthorized");
        }

        const data = await res.json();

        return data.items;
	}

    /**
     * @returns {Promise<PhoneNumber[]>}
     */
	async getNumbers (phoneLineId) {
        const userId = "w0";
		const res = await fetch(`https://api.sipgate.com/v2/${userId}/phonelines/${phoneLineId}/numbers`, {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
        });

        if (!res.ok) {
            this.access_token = null;
            throw Error("Unauthorized");
        }

        const data = await res.json();

        return data.items;
	}

    /**
     * @returns {Promise<Device[]>}
     */
	async getPhoneLineDevices (phoneLineId) {
        const userId = "w0";
		const res = await fetch(`https://api.sipgate.com/v2/${userId}/phonelines/${phoneLineId}/devices`, {
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
        });

        if (!res.ok) {
            this.access_token = null;
            throw Error("Unauthorized");
        }

        const data = await res.json();

        return data.items;
	}

	/**
     * @param {string} caller Device id to call from
     * @param {string} callee Phone number to call to
     * @param {string} deviceId Device id (required if caller is a phone number)
     * @param {string} callerId Caller ID to display to receiving party
     */
	async newCall(caller, callee, deviceId = caller, callerId = null) {
		const res = await fetch('https://api.sipgate.com/v2/sessions/calls', {
			method: "post",
			headers: {
				Authorization: `Bearer ${this.access_token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
                deviceId,
				caller,
                callee,
                callerId,
			})
        });

        if (!res.ok) {
            this.access_token = null;
            throw Error("Unauthorized");
        }
	}
}