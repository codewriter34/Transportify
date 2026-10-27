function toISO(ts) {
    try {
        if (!ts) return null;
        if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
        if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000).toISOString();
        if (typeof ts._seconds === 'number') return new Date(ts._seconds * 1000).toISOString();
        const asDate = new Date(ts);
        return Number.isNaN(asDate.getTime()) ? null : asDate.toISOString();
    } catch (_) {
        return null;
    }
}

function publicContact(person) {
    if (!person || typeof person !== 'object') return null;
    const name = typeof person.name === 'string' ? person.name.trim() : '';
    return name ? { name } : null;
}

function publicPackage(pkg) {
    if (!pkg || typeof pkg !== 'object') return null;
    const { carrierId, driverId, ...rest } = pkg;
    return rest;
}

function publicBill(data) {
    const bills = Array.isArray(data.bills) ? data.bills : [];
    const latest = bills[bills.length - 1];
    if (!latest || typeof latest !== 'object') return null;
    const price = Number(latest.price);
    return {
        title: latest.title || null,
        price: Number.isFinite(price) ? price : null,
        description: latest.description || null,
        sentAt: toISO(latest.sentAt)
    };
}

function toPublicShipment(doc) {
    const data = doc.data() || {};
    const normalizedHistory = (data.trackingHistory || []).map((entry) => ({
        status: entry?.status || null,
        location: entry?.location || null,
        timestamp: toISO(entry?.timestamp),
        notes: entry?.notes || null,
        coordinates: entry?.coordinates || null
    }));

    return {
        id: doc.id,
        trackingID: data.trackingID,
        status: data.status,
        estimatedDeliveryDate: toISO(data.estimatedDeliveryDate),
        lastUpdated: toISO(data.lastUpdated),
        origin: data.origin || null,
        destination: data.destination || null,
        sender: publicContact(data.sender),
        receiver: publicContact(data.receiver),
        package: publicPackage(data.package),
        currentLocation: data.currentLocation || null,
        trackingHistory: normalizedHistory,
        bill: publicBill(data)
    };
}

module.exports = { toPublicShipment };
