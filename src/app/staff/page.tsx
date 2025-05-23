import ProtectedLayout from "@/components/ProtectedLayout";

export default function StaffPage() {
    return (
        <ProtectedLayout>
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
                <p className="text-gray-600">
                    Welcome to the staff area. This page is only accessible to staff members.
                </p>
            </div>
        </ProtectedLayout>
    );
}