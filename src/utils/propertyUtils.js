/**
 * Utility functions for processing property transaction data
 */

/**
 * Parse South African Rand price string to number
 * @param {string} priceStr - Price string like "R 2 750 000" or "NIL"
 * @returns {number|null} - Price in Rands or null if invalid
 */
export const parsePrice = (priceStr) => {
  if (!priceStr || priceStr === 'NIL' || priceStr === 'CRST' || priceStr === 'CCT' || priceStr === 'nan') {
    return null;
  }
  const cleanedPrice = priceStr.replace(/[R ,]/g, '');
  const price = parseInt(cleanedPrice);
  return isNaN(price) ? null : price;
};

/**
 * Parse extent (area) string to number
 * @param {string} extentStr - Extent string like "120 m²"
 * @returns {number|null} - Area in square meters or null if invalid
 */
export const parseExtent = (extentStr) => {
  if (!extentStr || extentStr === 'nan') return null;
  const match = extentStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Calculate price per square meter
 * @param {number} price - Sale price in Rands
 * @param {number} extent - Area in square meters
 * @returns {number|null} - Price per sqm or null if can't calculate
 */
export const calculatePricePerSqm = (price, extent) => {
  if (!price || !extent || extent === 0) return null;
  return Math.round(price / extent);
};

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string like "2025-10-24 00:00:00"
 * @returns {Date|null} - Date object or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Format price for display
 * @param {number} price - Price in Rands
 * @returns {string} - Formatted price like "R 2,750,000"
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return 'N/A';
  // Compact format: billions, millions, or thousands
  if (price >= 1_000_000_000) {
    return `R${(price / 1_000_000_000).toFixed(1)}B`;
  } else if (price >= 10_000_000) {
    return `R${Math.round(price / 1_000_000)}M`;
  } else if (price >= 1_000_000) {
    return `R${(price / 1_000_000).toFixed(1)}M`;
  } else if (price >= 10_000) {
    return `R${Math.round(price / 1_000)}k`;
  } else if (price >= 1_000) {
    return `R${(price / 1_000).toFixed(1)}k`;
  }
  return `R${Math.round(price)}`;
};

/**
 * Format price per sqm for display
 * @param {number} pricePerSqm - Price per square meter
 * @returns {string} - Formatted price like "R 22,541/m²"
 */
export const formatPricePerSqm = (pricePerSqm) => {
  if (pricePerSqm === null || pricePerSqm === undefined || isNaN(pricePerSqm)) return 'N/A';
  // Compact format with k for thousands
  if (pricePerSqm >= 10000) {
    return `R${Math.round(pricePerSqm / 1000)}k/m²`;
  } else if (pricePerSqm >= 1000) {
    return `R${(pricePerSqm / 1000).toFixed(1)}k/m²`;
  }
  return `R${Math.round(pricePerSqm)}/m²`;
};

/**
 * Process individual property transactions from the properties array
 * @param {Array} properties - Array of property transaction objects
 * @returns {Object} - Aggregated statistics
 */
export const processPropertyTransactions = (properties) => {
  if (!properties || properties.length === 0) {
    return {
      count: 0,
      validTransactions: [],
      totalValue: 0,
      avgValue: null,
      avgPricePerSqm: null,
      minPricePerSqm: null,
      maxPricePerSqm: null,
      totalExtent: 0,
      avgExtent: null,
      dates: []
    };
  }

  const validTransactions = [];
  let totalValue = 0;
  let totalExtent = 0;
  let pricesPerSqm = [];
  let dates = [];

  properties.forEach(prop => {
    const price = parsePrice(prop.sale_price);
    const extent = parseExtent(prop.extent);
    const date = parseDate(prop.sale_date);

    if (price !== null) {
      validTransactions.push({
        property: prop.property,
        address: prop.address,
        propertyType: prop.property_type,
        usage: prop.usage,
        extent: extent,
        price: price,
        pricePerSqm: calculatePricePerSqm(price, extent),
        date: date,
        transactionType: prop.transaction_type,
        daysOnMarket: prop.days_on_market ? parseInt(prop.days_on_market) : null
      });

      totalValue += price;
      
      if (extent) {
        totalExtent += extent;
      }

      if (extent && price) {
        const pricePerSqm = calculatePricePerSqm(price, extent);
        if (pricePerSqm) {
          pricesPerSqm.push(pricePerSqm);
        }
      }

      if (date) {
        dates.push(date);
      }
    }
  });

  const avgPricePerSqm = pricesPerSqm.length > 0
    ? Math.round(pricesPerSqm.reduce((sum, p) => sum + p, 0) / pricesPerSqm.length)
    : null;

  const minPricePerSqm = pricesPerSqm.length > 0
    ? Math.min(...pricesPerSqm)
    : null;

  const maxPricePerSqm = pricesPerSqm.length > 0
    ? Math.max(...pricesPerSqm)
    : null;

  return {
    count: validTransactions.length,
    validTransactions,
    totalValue,
    avgValue: validTransactions.length > 0 ? Math.round(totalValue / validTransactions.length) : null,
    avgPricePerSqm,
    minPricePerSqm,
    maxPricePerSqm,
    totalExtent,
    avgExtent: totalExtent > 0 ? Math.round(totalExtent / validTransactions.length) : null,
    dates,
    earliestDate: dates.length > 0 ? new Date(Math.min(...dates)) : null,
    latestDate: dates.length > 0 ? new Date(Math.max(...dates)) : null
  };
};

/**
 * Filter properties by date range
 * @param {Array} properties - Array of property features
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Filtered properties
 */
export const filterByDateRange = (properties, startDate, endDate) => {
  if (!properties || !startDate || !endDate) return properties;

  return properties.filter(feature => {
    const propTransactions = feature.properties.properties || [];
    // Include if any transaction falls within the date range
    return propTransactions.some(prop => {
      const date = parseDate(prop.sale_date);
      return date && date >= startDate && date <= endDate;
    });
  });
};

/**
 * Group transactions by time period
 * @param {Array} properties - Array of property features
 * @param {string} interval - 'monthly' or 'quarterly'
 * @returns {Array} - Array of time period objects with transactions
 */
export const groupByTimePeriod = (properties, interval = 'monthly') => {
  const periods = new Map();
  const minDate = new Date('2025-01-01'); // Filter dates before Jan 2025

  properties.forEach(feature => {
    const propTransactions = feature.properties.properties || [];
    
    propTransactions.forEach(prop => {
      const price = parsePrice(prop.sale_price);
      if (price === null) return;

      const date = parseDate(prop.sale_date);
      if (!date || date < minDate) return; // Skip dates before Jan 2025

      let periodKey;
      if (interval === 'monthly') {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (interval === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periodKey = `${date.getFullYear()}-Q${quarter}`;
      }

      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          period: periodKey,
          date: new Date(date.getFullYear(), interval === 'monthly' ? date.getMonth() : (Math.floor(date.getMonth() / 3) * 3), 1),
          transactions: [],
          totalValue: 0,
          count: 0
        });
      }

      const periodData = periods.get(periodKey);
      periodData.transactions.push({
        ...prop,
        feature,
        parsedPrice: price
      });
      periodData.totalValue += price;
      periodData.count += 1;
    });
  });

  // Convert to array and sort by date
  return Array.from(periods.values()).sort((a, b) => a.date - b.date);
};

/**
 * Calculate overall statistics for all properties
 * @param {Array} features - GeoJSON features array
 * @returns {Object} - Overall statistics
 */
export const calculateOverallStats = (features) => {
  if (!features || features.length === 0) {
    return {
      totalLocations: 0,
      totalTransactions: 0,
      totalValue: 0,
      avgTransactionValue: null,
      avgPricePerSqm: null,
      minPricePerSqm: null,
      maxPricePerSqm: null,
      byCategory: {},
      byTransactionType: {},
      priceDistribution: []
    };
  }

  let totalTransactions = 0;
  let totalValue = 0;
  let allPricesPerSqm = [];
  const byCategory = {};
  const byTransactionType = {};
  const allPrices = [];

  features.forEach(feature => {
    const stats = processPropertyTransactions(feature.properties.properties);
    totalTransactions += stats.count;
    totalValue += stats.totalValue;

    if (stats.avgPricePerSqm) {
      allPricesPerSqm.push(stats.avgPricePerSqm);
    }

    stats.validTransactions.forEach(t => {
      allPrices.push(t.price);
    });

    // Group by category
    const category = feature.properties.property_category || 'Unknown';
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, totalValue: 0 };
    }
    byCategory[category].count += stats.count;
    byCategory[category].totalValue += stats.totalValue;

    // Group by transaction type
    const txType = feature.properties.transaction_type || 'Unknown';
    if (!byTransactionType[txType]) {
      byTransactionType[txType] = { count: 0, totalValue: 0 };
    }
    byTransactionType[txType].count += stats.count;
    byTransactionType[txType].totalValue += stats.totalValue;
  });

  // Create price distribution buckets
  const buckets = [
    { max: 500000, label: '< R500k', count: 0 },
    { max: 1000000, label: 'R500k - R1M', count: 0 },
    { max: 2500000, label: 'R1M - R2.5M', count: 0 },
    { max: 5000000, label: 'R2.5M - R5M', count: 0 },
    { max: 10000000, label: 'R5M - R10M', count: 0 },
    { max: Infinity, label: '> R10M', count: 0 }
  ];

  allPrices.forEach(price => {
    for (let bucket of buckets) {
      if (price < bucket.max) {
        bucket.count += 1;
        break;
      }
    }
  });

  // Calculate median values
  const sortedPrices = [...allPrices].sort((a, b) => a - b);
  const sortedPricesPerSqm = [...allPricesPerSqm].sort((a, b) => a - b);
  const medianPrice = sortedPrices.length > 0 
    ? sortedPrices[Math.floor(sortedPrices.length / 2)]
    : null;
  const medianPricePerSqm = sortedPricesPerSqm.length > 0
    ? sortedPricesPerSqm[Math.floor(sortedPricesPerSqm.length / 2)]
    : null;

  return {
    totalLocations: features.length,
    totalTransactions,
    totalValue,
    avgTransactionValue: totalTransactions > 0 ? Math.round(totalValue / totalTransactions) : null,
    medianTransactionValue: medianPrice,
    avgPricePerSqm: allPricesPerSqm.length > 0
      ? Math.round(allPricesPerSqm.reduce((sum, p) => sum + p, 0) / allPricesPerSqm.length)
      : null,
    medianPricePerSqm,
    minPricePerSqm: allPricesPerSqm.length > 0 ? Math.min(...allPricesPerSqm) : null,
    maxPricePerSqm: allPricesPerSqm.length > 0 ? Math.max(...allPricesPerSqm) : null,
    minPrice: allPrices.length > 0 ? Math.min(...allPrices) : null,
    maxPrice: allPrices.length > 0 ? Math.max(...allPrices) : null,
    byCategory,
    byTransactionType,
    priceDistribution: buckets
  };
};
