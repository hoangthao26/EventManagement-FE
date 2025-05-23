import ProtectedLayout from "@/components/ProtectedLayout";

export default function MemberPage() {
    return (
        <ProtectedLayout>
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
                <p className="text-gray-600">
                    Welcome to the member area. This page is accessible to students and teachers.
                </p>
            </div>
        </ProtectedLayout>
    );
}