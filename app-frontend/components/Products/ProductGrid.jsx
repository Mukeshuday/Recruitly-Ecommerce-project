"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Space, Input, App } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

// ✅ Import custom cell renderers
import { PriceCell, StockBadge, ImageThumb } from "./cellRenders";

// ✅ AG Grid v34+ community modules
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

// ✅ Legacy CSS theme imports
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function ProductGrid() {
  const { message } = App.useApp();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const gridRef = useRef(null); // ✅ useRef for grid API access

  // ✅ Columns
  const columnDefs = useMemo(
    () => [
      { headerName: "Image", field: "images", cellRenderer: ImageThumb, width: 80 },
      { headerName: "Name", field: "name", sortable: true, filter: true, flex: 2 },
      { headerName: "Category", field: "category", sortable: true, filter: true, flex: 1 },
      {
        headerName: "Price",
        field: "price",
        sortable: true,
        flex: 1,
        cellRenderer: PriceCell,
      },
      {
        headerName: "Stock",
        field: "stock",
        flex: 1,
        cellRenderer: StockBadge,
      },
      { headerName: "Supplier", field: "supplier", flex: 2 },
    ],
    []
  );

  // ✅ API base from environment variable
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ Fetch products
  const fetchProducts = useCallback(
    async (searchTerm = search) => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?limit=100&includeSupplier=false&search=${encodeURIComponent(
            searchTerm
          )}`
        );
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        const data = await res.json();
        setRowData(data.items || []);
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [search, message, API_URL]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ CSV Export
  const onExport = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Space style={{ marginBottom: 10 }}>
        <Input
          placeholder="Search products"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => fetchProducts(search)}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchProducts(search)}
          loading={loading}
        >
          Refresh
        </Button>
        <Button icon={<DownloadOutlined />} onClick={onExport}>
          Export CSV
        </Button>
      </Space>

      {/* ✅ Legacy theme mode so CSS works */}
      <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          pagination
          paginationPageSize={20}
          animateRows
          theme="legacy"
        />
      </div>
    </div>
  );
}
