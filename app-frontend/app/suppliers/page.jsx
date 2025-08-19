'use client';
import { Typography } from "antd";
import SupplierGrid from "@/components/Suppliers/SupplierGrid";

export default function SupplierPage() {
    return(
        <div style={{padding:16}}>
            <Typography.Title level={3}>Suppliers</Typography.Title>
            <SupplierGrid />
        </div>
    )
}