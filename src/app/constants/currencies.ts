export interface Currency {
    code: string;
    name: string;
    symbol: string;
}

export const CURRENCIES: Currency[] = [
    // South America
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/.' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
    { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲' },
    { code: 'UYU', name: 'Peso Uruguayo', symbol: '$' },
    { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.' },

    // North/Central America & Caribbean
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$' },
    { code: 'CRC', name: 'Colón Costarricense', symbol: '₡' },
    { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$' },
    { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q' },
    { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L' },
    { code: 'NIO', name: 'Córdoba Nicaragüense', symbol: 'C$' },
    { code: 'PAB', name: 'Balboa Panameño', symbol: 'B/.' },

    // Europe
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'CHF', name: 'Franco Suizo', symbol: 'Fr.' },
    { code: 'SEK', name: 'Corona Sueca', symbol: 'kr' },
    { code: 'NOK', name: 'Corona Noruega', symbol: 'kr' },
    { code: 'DKK', name: 'Corona Danesa', symbol: 'kr' },
    { code: 'PLN', name: 'Zloty Polaco', symbol: 'zł' },
    { code: 'CZK', name: 'Corona Checa', symbol: 'Kč' },
    { code: 'HUF', name: 'Forinto Húngaro', symbol: 'Ft' },
    { code: 'RON', name: 'Leu Rumano', symbol: 'lei' }
];

export const getCurrencySymbol = (code: string | undefined): string => {
    if (!code) return '';
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.symbol : code;
};
