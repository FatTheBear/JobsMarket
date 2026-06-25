# 1. PROBLEM DEFINITION

## 1.1. Flowchart Tính Năng Quản Lý, Lọc, Duyệt Ứng Viên & CV

```mermaid
graph TD
    A[Bat dau: Danh sach Ung vien va CV] --> B(Su dung Bo loc?)
    
    B -- Co --> C[Loc theo tieu chi: Ky nang, Kinh nghiem...]
    B -- Khong --> D(Su dung Global Search?)
    
    D -- Co --> E[Nhap tu khoa tim kiem toan he thong]
    D -- Khong --> F[Xem danh sach mac dinh]
    
    C --> G[Hien thi ket qua loc hoac tim kiem]
    E --> G
    F --> G
    
    G --> H[Chon mot CV hoac Ung vien cu the]
    H --> I[Xem chi tiet CV va Lich su Workflow]
    
    I --> J(Quyet dinh duyet CV?)
    
    J -- Dat yeu cau --> K[Chuyen trang thai: Duyet / Hen phong van]
    J -- Khong dat --> L[Chuyen trang thai: Tu choi / Luu tru]
    
    K --> M[Data Management: Cap nhat DB va Gui thong bao]
    L --> M
    
    M --> N[Ket thuc Quy trinh]