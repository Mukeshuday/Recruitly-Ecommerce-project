"use client";

import { useEffect, useState } from "react";
import {
  Table,
  DatePicker,
  Select,
  Button,
  InputNumber,
  Card,
  Row,
  Col,
  Form,
  message,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import { Line, Pie } from "@ant-design/charts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function InventoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({});
  const [stockTrends, setStockTrends] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [categoryMetric, setCategoryMetric] = useState("productCount");

  const [filters, setFilters] = useState({
    dateRange: null,
    product: null,
    type: null,
  });

  // ✅ Safe JSON parser with status check
  const safeJson = async (res, endpointName) => {
    if (!res.ok) {
      console.error(`❌ Error fetching ${endpointName}:`, res.status, res.statusText);
      return {};
    }
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error(`❌ JSON parse error from ${endpointName}`, e);
      return {};
    }
  };

  // Fetch all initial data
  useEffect(() => {
    fetchProducts();
    fetchData();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      const data = await safeJson(res, `${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      setProductList(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) {
        params.append("from", filters.dateRange[0].format("YYYY-MM-DD"));
        params.append("to", filters.dateRange[1].format("YYYY-MM-DD"));
      }
      if (filters.product) params.append("product", filters.product);
      if (filters.type) params.append("type", filters.type);

      const [statsRes, trendsRes, categoriesRes, transactionsRes] =
        await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/inventory`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/stock-movements?${params.toString()}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${params.toString()}`),
        ]);

      const stats = await safeJson(statsRes, "/api/analytics/inventory");
      const trends = await safeJson(trendsRes, "/api/analytics/stock-movements");
      const categories = await safeJson(categoriesRes, "/api/analytics/categories");
      const transactionsData = await safeJson(transactionsRes, "/api/transactions");

      setInventoryStats(stats);

      // ✅ Normalize trends for chart
      if (trends?.dailyMovements) {
        setStockTrends(
          trends.dailyMovements.map((t) => ({
            date: t.date,
            type: t.type,
            quantity: t.totalQuantity,
          }))
        );
      } else {
        setStockTrends([]);
      }

      // ✅ Normalize categories for pie + table
      if (Array.isArray(categories)) {
        setCategoriesData(
          categories.map((c) => ({
            category: c._id,
            productCount: c.productCount || c.count || 0,
            totalStock: c.totalStock || 0,
            stockValue: c.stockValue || 0,
            potentialRevenue: c.potentialRevenue || 0,
            lowStockCount: c.lowStockCount || 0,
          }))
        );
      } else {
        setCategoriesData([]);
      }

      setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData.transactions || []);
    } catch (err) {
      console.error("Error fetching inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjust = async (values) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: values.product,
          type: "ADJUSTMENT",
          quantity: values.adjustment,
          reason: "Manual adjustment",
          performedBy: "Admin",
        }),
      });

      if (res.ok) {
        message.success(`Stock adjusted for ${values.product}`);
        fetchData();
      } else {
        throw new Error("Adjustment failed");
      }
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (val) => dayjs(val).format("YYYY-MM-DD"),
    },
    {
      title: "Product",
      dataIndex: ["productId", "name"],
      key: "product",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colors = { IN: "green", OUT: "red", ADJUSTMENT: "orange" };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    { title: "Quantity", dataIndex: "quantity", key: "qty" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    {
      title: "Reference ID",
      dataIndex: "referenceId",
      key: "ref",
      render: (ref) =>
        ref ? (
          <Tooltip title="Reference ID">
            <Tag color="blue">{ref}</Tag>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    { title: "Performed By", dataIndex: "performedBy", key: "by" },
  ];

  const stockTrendConfig = {
    data: stockTrends,
    xField: "date",
    yField: "quantity",
    seriesField: "type",
    smooth: true,
    height: 300,
    color: ["#52c41a", "#ff4d4f", "#fa8c16"],
  };

  const categoriesConfig = {
    appendPadding: 10,
    data: categoriesData.map((c) => ({
      type: c.category,
      value: c[categoryMetric] || 0,
    })),
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    label: {
      type: "inner",
      offset: "-30%",
      content: "{value}",
      style: { fontSize: 14, textAlign: "center" },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Inventory Dashboard</h1>

      {loading && <Spin style={{ marginBottom: 16 }} />}

      {/* Summary Cards */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Total Stock Value" variant="borderless">
            ${inventoryStats.totalStockValue?.toLocaleString() || 0}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Low Stock Items" variant="borderless">
            {inventoryStats.lowStockCount || 0}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Total Products" variant="borderless">
            {inventoryStats.totalProducts || 0}
          </Card>
        </Col>
      </Row>

      <br />

      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker
            onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
          />
        </Col>
        <Col>
          <Select
            placeholder="Product"
            style={{ width: 180 }}
            allowClear
            onChange={(val) => setFilters({ ...filters, product: val })}
          >
            {productList.map((p) => (
              <Option key={p._id} value={p._id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Type"
            style={{ width: 150 }}
            allowClear
            onChange={(val) => setFilters({ ...filters, type: val })}
          >
            <Option value="IN">IN</Option>
            <Option value="OUT">OUT</Option>
            <Option value="ADJUSTMENT">ADJUSTMENT</Option>
          </Select>
        </Col>
        <Col>
          <Button onClick={() => setFilters({ dateRange: null, product: null, type: null })}>
            Reset Filters
          </Button>
        </Col>
      </Row>

      {/* Transactions Table */}
      <Table
        dataSource={transactions}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <br />

      {/* Quick Stock Adjustment */}
      <Card title="Quick Stock Adjustment">
        <Form layout="inline" onFinish={handleStockAdjust}>
          <Form.Item
            name="product"
            rules={[{ required: true, message: "Product required" }]}
          >
            <Select placeholder="Product" style={{ width: 180 }}>
              {productList.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="adjustment"
            rules={[{ required: true, message: "Enter quantity" }]}
          >
            <InputNumber placeholder="Qty" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Adjust
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <br />

      {/* Stock Trends */}
      <Card title="Stock Movement Trends">
        <Line {...stockTrendConfig} />
      </Card>

      <br />

      {/* Categories Pie + Summary */}
      <Card
        title="Products by Category"
        extra={
          <Select
            value={categoryMetric}
            style={{ width: 200 }}
            onChange={(val) => setCategoryMetric(val)}
          >
            <Option value="productCount">Products Count</Option>
            <Option value="totalStock">Total Stock</Option>
            <Option value="stockValue">Stock Value ($)</Option>
            <Option value="potentialRevenue">Potential Revenue ($)</Option>
            <Option value="lowStockCount">Low Stock Count</Option>
          </Select>
        }
      >
        <Pie {...categoriesConfig} />

        {/* Category Summary Table */}
        <Table
          dataSource={categoriesData.map((c, idx) => ({
            key: idx,
            category: c.category,
            productCount: c.productCount,
            totalStock: c.totalStock,
            stockValue: c.stockValue,
            potentialRevenue: c.potentialRevenue,
            lowStockCount: c.lowStockCount,
          }))}
          columns={[
            { title: "Category", dataIndex: "category", key: "category" },
            { title: "Products", dataIndex: "productCount", key: "productCount" },
            { title: "Total Stock", dataIndex: "totalStock", key: "totalStock" },
            { title: "Stock Value ($)", dataIndex: "stockValue", key: "stockValue" },
            { title: "Potential Revenue ($)", dataIndex: "potentialRevenue", key: "potentialRevenue" },
            { title: "Low Stock", dataIndex: "lowStockCount", key: "lowStockCount" },
          ]}
          pagination={false}
          style={{ marginTop: 20 }}
        />
      </Card>
    </div>
  );
}
