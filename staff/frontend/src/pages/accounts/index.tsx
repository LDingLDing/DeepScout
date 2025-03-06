import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import StaffLayout from '../../components/staff/StaffLayout';
import { getAllStaff, createStaff, updateStaff, resetPassword, Staff } from '../../api/staff';

const { Option } = Select;

const StaffAccounts: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | undefined>(undefined);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 获取所有管理人员
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaffList(data);
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
      message.error('获取管理人员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 打开添加/编辑管理员模态框
  const showModal = (staff?: Staff) => {
    setCurrentStaff(staff || undefined);
    form.resetFields();
    
    if (staff) {
      form.setFieldsValue({
        id: staff.id,
        username: staff.username,
        email: staff.email,
        role: staff.role,
        isActive: staff.isActive
      });
    }
    
    setModalVisible(true);
  };

  // 打开重置密码模态框
  const showResetPasswordModal = (staffId: number) => {
    setCurrentStaff(staffList.find(staff => staff.id === staffId));
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      // 使用form.validateFields获取表单的值
      const values = await form.validateFields();
      
      if (currentStaff) {
        // 更新现有管理员
        const updateData = {
          email: values.email,
          role: values.role,
          isActive: typeof values.isActive === 'string' ? values.isActive === 'true' : Boolean(values.isActive)
        };
        const result = await updateStaff(currentStaff.id, updateData);
        message.success('管理员信息更新成功');
      } else {
        // 创建新管理员
        const createData = {
          username: values.username,
          password: values.password,
          email: values.email,
          role: values.role
        };
        await createStaff(createData);
        message.success('管理员创建成功');
      }
      
      setModalVisible(false);
      // 获取最新的管理人员列表
      await fetchStaff();
    } catch (error: any) {
      console.error('Form submission failed:', error);
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  // 重置密码
  const handleResetPassword = async (values: any) => {
    try {
      if (!currentStaff) {
        message.error('请选择要操作的管理员');
        return;
      }
      
      if (!values.password) {
        message.error('密码不能为空');
        return;
      }
      
      await resetPassword(currentStaff.id, values.password);
      message.success('密码重置成功');
      setPasswordModalVisible(false);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      message.error(error.response?.data?.message || '密码重置失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap: Record<string, { color: string; label: string }> = {
          admin: { color: 'blue', label: '管理员' },
          manager: { color: 'green', label: '运营' },
          viewer: { color: 'default', label: '只读用户' },
        };
        
        const { color, label } = roleMap[role] || { color: 'default', label: role };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => {
        return isActive ? 
          <Tag color="success">启用</Tag> : 
          <Tag color="error">禁用</Tag>;
      },
    },
    {
      title: '最近更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            icon={<LockOutlined />} 
            onClick={() => showResetPasswordModal(record.id)}
          >
            重置密码
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <StaffLayout>
      <div style={{ padding: '0 0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>账号管理</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            添加管理员
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={staffList} 
          rowKey="id"
          loading={loading}
        />
      </div>

      {/* 添加/编辑管理员模态框 */}
      <Modal
        title={currentStaff ? '编辑管理员' : '添加管理员'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={currentStaff ? '更新' : '添加'}
        cancelText="取消"
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input disabled={!!currentStaff} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: false, message: '请输入邮箱' }]}
          >
            <Input />
          </Form.Item>
          
          {!currentStaff && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="viewer">只读用户</Option>
            </Select>
          </Form.Item>
          
          {currentStaff && (
            <Form.Item
              name="isActive"
              label="状态"
            >
              <Select>
                <Option value="true">启用</Option>
                <Option value="false">禁用</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 重置密码模态框 */}
      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onOk={() => passwordForm.submit()}
        onCancel={() => setPasswordModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请输入确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </StaffLayout>
  );
};

export default StaffAccounts;
