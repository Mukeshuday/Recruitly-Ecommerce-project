'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Space, App } from 'antd';

export default function SupplierGrid() {
  const { message } = App.useApp(); // ✅ use hook instead of static message
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form] = Form.useForm();

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/suppliers');
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      message.error(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openModal = (supplier = null) => {
    form.resetFields();
    if (supplier) form.setFieldsValue(supplier);
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      message.success('Supplier deleted');
      fetchSuppliers();
    } catch (err) {
      message.error(err.message || 'Failed to delete supplier');
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingSupplier) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${editingSupplier._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Supplier updated');
      } else {
        await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        message.success('Supplier added');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      message.error(err.message || 'Operation failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Contact Person', dataIndex: 'contactPerson' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Active', dataIndex: 'isActive', render: (v) => (v ? 'Yes' : 'No') },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => openModal()}>
        Add Supplier
      </Button>
      <Table
        rowKey="_id"
        dataSource={suppliers}
        columns={columns}
        loading={loading}
      />

      <Modal
        open={modalOpen}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name={['address', 'street']} label="Street">
            <Input />
          </Form.Item>
          <Form.Item name={['address', 'city']} label="City">
            <Input />
          </Form.Item>
          <Form.Item name={['address', 'state']} label="State">
            <Input />
          </Form.Item>
          <Form.Item name={['address', 'zipCode']} label="Zip Code">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
