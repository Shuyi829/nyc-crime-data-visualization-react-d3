import { csv, sum } from 'd3';
import React, { useEffect, useState } from 'react';

function FetchData({ url }) {
  const [jsonData, setJsonData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setJsonData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [url]);

  const data = Object.values(jsonData);
  console.log(typeof data); // true

  const sumForKey = (data, key) => {
    return data.reduce((sum, d) => {
      const precinctMap = d.precinct_type_map || {};
      const count = precinctMap[key] || 0;
      return sum + count;
    }, 0);
  };

  const totalCount = sumForKey(data, '10'); // 计算所有precinct_type_map中键值为10的数量之和
  console.log(totalCount);

  return <div>{jsonData ? <pre>{data}</pre> : <p>Loading...</p>}</div>;
}

export default FetchData;
