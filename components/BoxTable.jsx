import React, { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { DataTable } from "react-native-paper";
import axios from "axios";

const itemsPerPage = 2; // Number of rows per page

const BoxTable = ({ selectedFileId, selectedDistrict, selectedBranch }) => {
    const [boxes, setBoxes] = useState([]);
    const [gridColumns, setGridColumns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchBoxes();
    }, [selectedFileId, selectedBranch]);

    const fetchBoxes = async () => {
        if (!selectedFileId || !selectedBranch) {
            console.warn("File ID or selected branch is missing");
            return;
        }
        setLoading(true); // Start loader only when fetching begins
        try {
            const url = `http://116.72.230.95:99/api/MTMLP/GET_BOXES_FOR_BRANCH?FileId=${selectedFileId}&District=${selectedDistrict}&BrachCode=${selectedBranch}`;
            console.log("fetchBoxes url", url);
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (response.data.Status === 302) {
                console.log("fetchBoxes", response.data);
                setGridColumns(response.data.Data.Columns);
                setBoxes(response.data.Data.GridData);
            }
        } catch (error) {
            console.error("Error fetching boxes:", error);
        } finally {
            setLoading(false);
        }
    };

    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleData = boxes.slice(startIndex, endIndex);

    return (
        <View style={styles.container}>
      <ScrollView  horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            width: '100%',
          }}>
        <View style={{ flex: 1, minWidth: "100%" }}>
          <DataTable>
            {/* Table Header - Dynamic */}
            <DataTable.Header>
              {gridColumns.map((col, index) => (
                <DataTable.Title key={index} style={{ flex: 1 }}>{col}</DataTable.Title>
              ))}
            </DataTable.Header>

            {/* Table Rows */}
            {loading ? (
              <DataTable.Row>
                <DataTable.Cell>Loading...</DataTable.Cell>
              </DataTable.Row>
            ) : (
              visibleData.map((item, index) => {
                const isDelivered = !!item.Field2;
                const backgroundColor = isDelivered ? "#d4edda" : "white";
                const textColor = isDelivered ? "#000" : "#333";

                return (
                  <DataTable.Row key={index} style={{ backgroundColor }}>
                    <DataTable.Cell style={{ flex: 1 }} textStyle={{ color: textColor }}>
                      {item.Field1}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} textStyle={{ color: textColor }}>
                      {item.Field2 || "Not Delivered"}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} textStyle={{ color: textColor }}>
                      {item.Field3 || "-"}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} textStyle={{ color: textColor }}>
                      {item.Field4 || "-"}
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })
            )}

            {/* Pagination Controls */}
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(boxes.length / itemsPerPage)}
              onPageChange={(newPage) => setPage(Math.max(0, newPage))}
              label={`${startIndex + 1}-${Math.min(endIndex, boxes.length)} of ${boxes.length}`}
            />
          </DataTable>
        </View>
      </ScrollView>
    </View>
    );
};
const styles = StyleSheet.create({
    container:{
		flex:1,
		justifyContent:'stretch'
	},	
	contentContainer:{
		flex:1

	}
  
});
export default BoxTable;
