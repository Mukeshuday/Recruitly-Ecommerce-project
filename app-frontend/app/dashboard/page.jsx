"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Typography, Statistic, List } from "antd";
import {
  ShoppingOutlined,
  WarningOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { Area } from "@ant-design/plots";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ Use backend API from .env
      const res = await fetch(`${API_URL}/api/dashboard`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!stats) return <p>Loading...</p>;

  // Safe destructuring with defaults
  const totalProducts = stats?.totalProducts ?? 0;
  const lowStockItems = Array.isArray(stats?.lowStockItems) ? stats.lowStockItems : [];
  const totalValue = stats?.totalValue ?? 0;
  const stockMovements = Array.isArray(stats?.stockMovements) ? stats.stockMovements : [];
  const mostSellingCategories = Array.isArray(stats?.mostSellingCategories) ? stats.mostSellingCategories : [];
  const recentTransactions = Array.isArray(stats?.recentTransactions) ? stats.recentTransactions : [];

  // Transform stockMovements for chart
  const chartData = stockMovements.map((d) => ({
    date: new Date(d._id).toLocaleDateString(),
    stockIn: d.stockIn || 0,
    stockOut: d.stockOut || 0,
  }));

  const inSeries = chartData.map((d) => ({
    date: d.date,
    value: d.stockIn,
    type: "Stock In",
  }));

  const outSeries = chartData.map((d) => ({
    date: d.date,
    value: d.stockOut,
    type: "Stock Out",
  }));

  const chartConfig = {
    data: [...inSeries, ...outSeries],
    xField: "date",
    yField: "value",
    seriesField: "type",
    smooth: true,
    height: 250,
    color: ["#52c41a", "#ff4d4f"],
    point: { size: 3, shape: "circle" },
    tooltip: { shared: true },
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Top Stats Cards */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={lowStockItems.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={totalValue}
              prefix={<DollarCircleOutlined />}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Stock Movement Trends Chart */}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Stock Movement Trends (Last 14 Days)">
            <Area {...chartConfig} />
          </Card>
        </Col>
      </Row>

      {/* Most Selling Categories & Low Stock Items */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Most Selling Categories (Last 30 Days)">
            <List
              dataSource={mostSellingCategories}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text>
                    {item._id || "Uncategorized"}
                  </Typography.Text>
                  <span>{item.totalSold || 0} sold</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Low Stock Items">
            <Table
              size="small"
              dataSource={lowStockItems}
              rowKey="_id"
              columns={[
                { title: "Name", dataIndex: "name" },
                { title: "SKU", dataIndex: "sku" },
                { title: "Stock", dataIndex: "currentStock" },
                { title: "Min Stock", dataIndex: "minimumStock" },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card title="Recent Stock Transactions">
            <Table
              size="small"
              dataSource={recentTransactions}
              rowKey="_id"
              columns={[
                {
                  title: "Date",
                  dataIndex: "createdAt",
                  render: (v) => new Date(v).toLocaleString(),
                },
                {
                  title: "Product",
                  render: (_, r) =>
                    `${r.productId?.name || "Unknown"} (${r.productId?.sku || ""})`,
                },
                { title: "Type", dataIndex: "type" },
                { title: "Quantity", dataIndex: "quantity" },
                { title: "Reason", dataIndex: "reason" },
                { title: "Performed By", dataIndex: "performedBy" },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
